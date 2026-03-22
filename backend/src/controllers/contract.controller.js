import Contract from "../models/Contract.model.js";
import User from "../models/User.model.js";
import Conversation from "../models/Conversation.model.js";
import Message from "../models/Message.model.js";
import { getIO } from "../config/socket.js";
import { createNotification } from "../services/notification.service.js";

const populateFields = [
  { path: "hirer", select: "name profilePhoto badgeLevel" },
  { path: "freelancer", select: "name profilePhoto badgeLevel" },
  { path: "rating", select: "averageScore comment workQuality communication reliability" },
];

// GET /api/contracts/user/:userId
export async function getUserContracts(req, res, next) {
  try {
    const { userId } = req.params;
    const contracts = await Contract.find({
      $or: [{ hirer: userId }, { freelancer: userId }],
    })
      .populate(populateFields)
      .sort({ createdAt: -1 })
      .lean();
    res.json({ contracts });
  } catch (err) { next(err); }
}

// GET /api/contracts/me
export async function getMyContracts(req, res, next) {
  try {
    const userId = req.user._id;
    const { status, role } = req.query;
    const query = {};
    if (role === "hirer") query.hirer = userId;
    else if (role === "freelancer") query.freelancer = userId;
    else query.$or = [{ hirer: userId }, { freelancer: userId }];
    if (status && status !== "all") query.status = status;

    const contracts = await Contract.find(query)
      .populate(populateFields)
      .sort({ createdAt: -1 })
      .lean();
    res.json({ contracts });
  } catch (err) { next(err); }
}

// GET /api/contracts/:id
export async function getContractById(req, res, next) {
  try {
    const contract = await Contract.findById(req.params.id)
      .populate(populateFields)
      .lean();
    if (!contract) return res.status(404).json({ message: "Contract not found" });
    res.json({ contract });
  } catch (err) { next(err); }
}

// POST /api/contracts
export async function createContract(req, res, next) {
  try {
    const { freelancerId, title, description, skills, amount, rateType, startDate, endDate } = req.body;
    if (!freelancerId || !title) {
      return res.status(400).json({ message: "Freelancer and title are required" });
    }
    if (freelancerId === req.user._id.toString()) {
      return res.status(400).json({ message: "Cannot create a contract with yourself" });
    }

    const contract = await Contract.create({
      hirer: req.user._id,
      freelancer: freelancerId,
      title, description,
      skills: skills || [],
      amount: amount || 0,
      rateType: rateType || "",
      startDate: startDate || new Date(),
      endDate: endDate || null,
      status: "pending",
    });

    const populated = await Contract.findById(contract._id).populate(populateFields).lean();

    await createNotification({
      recipient: freelancerId,
      sender: req.user._id,
      type: "contract_received",
      contract: contract._id,
      message: `sent you a contract: "${title}"`,
    });

    // Auto-send contract message into conversation
    let conv = await Conversation.findOne({
      participants: { $all: [req.user._id, freelancerId] },
    });
    if (!conv) {
      conv = await Conversation.create({ participants: [req.user._id, freelancerId] });
    }

    const contractMsg = await Message.create({
      conversation: conv._id,
      sender: req.user._id,
      text: `📋 Contract: ${title}`,
      messageType: "contract",
      contract: contract._id,
      readBy: [req.user._id],
    });

    await contractMsg.populate("sender", "name profilePhoto");
    await contractMsg.populate({
      path: "contract",
      populate: [
        { path: "hirer", select: "name profilePhoto" },
        { path: "freelancer", select: "name profilePhoto" },
      ],
    });

    await Conversation.findByIdAndUpdate(conv._id, {
      lastMessage: { text: `📋 Contract: ${title}`, sender: req.user._id, timestamp: new Date() },
    });

    getIO().to(conv._id.toString()).emit("message:receive", contractMsg);

    res.status(201).json({ contract: populated, conversationId: conv._id });
  } catch (err) { next(err); }
}

// PUT /api/contracts/:id/accept — freelancer only
export async function acceptContract(req, res, next) {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) return res.status(404).json({ message: "Contract not found" });
    if (contract.freelancer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the freelancer can accept" });
    }
    if (contract.status !== "pending") {
      return res.status(400).json({ message: "Can only accept pending contracts" });
    }

    contract.status = "active";
    await contract.save();

    await createNotification({
      recipient: contract.hirer,
      sender: req.user._id,
      type: "contract_accepted",
      contract: contract._id,
      message: `accepted your contract: "${contract.title}"`,
    });

    const populated = await Contract.findById(contract._id).populate(populateFields).lean();
    res.json({ contract: populated });
  } catch (err) { next(err); }
}

// PUT /api/contracts/:id/decline — freelancer only
export async function declineContract(req, res, next) {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) return res.status(404).json({ message: "Contract not found" });
    if (contract.freelancer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the freelancer can decline" });
    }
    if (contract.status !== "pending") {
      return res.status(400).json({ message: "Can only decline pending contracts" });
    }

    contract.status = "cancelled";
    contract.declinedAt = new Date();
    await contract.save();

    await createNotification({
      recipient: contract.hirer,
      sender: req.user._id,
      type: "contract_declined",
      contract: contract._id,
      message: `declined your contract: "${contract.title}"`,
    });

    const populated = await Contract.findById(contract._id).populate(populateFields).lean();
    res.json({ contract: populated });
  } catch (err) { next(err); }
}

// PUT /api/contracts/:id/status
export async function updateContractStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status, disputeReason } = req.body;
    const contract = await Contract.findById(id);
    if (!contract) return res.status(404).json({ message: "Contract not found" });

    const userId = req.user._id.toString();
    const isHirer = contract.hirer.toString() === userId;
    const isFreelancer = contract.freelancer.toString() === userId;
    if (!isHirer && !isFreelancer) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Permission checks per status transition
    if (status === "completed") {
      if (!isHirer) return res.status(403).json({ message: "Only the hirer can mark completed" });
      if (contract.status !== "active") return res.status(400).json({ message: "Can only complete active contracts" });
      contract.completedAt = new Date();

      // Auto-increment completedJobs on freelancer
      await User.findByIdAndUpdate(contract.freelancer, { $inc: { completedJobs: 1 } });
    } else if (status === "cancelled") {
      if (!isHirer) return res.status(403).json({ message: "Only the hirer can cancel" });
      if (!["pending", "active"].includes(contract.status)) {
        return res.status(400).json({ message: "Cannot cancel this contract" });
      }
      contract.cancelledAt = new Date();
    } else if (status === "disputed") {
      if (!["active"].includes(contract.status)) {
        return res.status(400).json({ message: "Can only dispute active contracts" });
      }
      if (disputeReason) contract.disputeReason = disputeReason;
    } else {
      return res.status(400).json({ message: "Invalid status transition" });
    }

    contract.status = status;
    await contract.save();

    // Notify the other party
    const otherParty = isHirer ? contract.freelancer : contract.hirer;
    const typeMap = { completed: "contract_completed", cancelled: "contract_cancelled", disputed: "contract_disputed" };
    await createNotification({
      recipient: otherParty,
      sender: req.user._id,
      type: typeMap[status],
      contract: contract._id,
      message: status === "completed" ? `marked contract "${contract.title}" as completed`
        : status === "cancelled" ? `cancelled contract "${contract.title}"`
        : `raised a dispute on contract "${contract.title}"`,
    });

    const populated = await Contract.findById(id).populate(populateFields).lean();
    res.json({ contract: populated });
  } catch (err) { next(err); }
}

// POST /api/contracts/:id/modification-request — freelancer only
export async function requestModification(req, res, next) {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) return res.status(404).json({ message: "Contract not found" });
    if (contract.freelancer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the freelancer can request modifications" });
    }
    if (!["pending", "active"].includes(contract.status)) {
      return res.status(400).json({ message: "Cannot request modification on this contract" });
    }

    const { fields, notes } = req.body;
    contract.modificationRequests.push({
      fields: Array.isArray(fields) ? fields : [],
      notes: notes || "",
      status: "pending",
    });
    await contract.save();

    const populated = await Contract.findById(contract._id).populate(populateFields).lean();
    res.json({ contract: populated });
  } catch (err) { next(err); }
}

// PUT /api/contracts/:id/modification-request/:reqId — hirer only
export async function resolveModificationRequest(req, res, next) {
  try {
    const contract = await Contract.findById(req.params.id);
    if (!contract) return res.status(404).json({ message: "Contract not found" });
    if (contract.hirer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the hirer can resolve modification requests" });
    }

    const modReq = contract.modificationRequests.id(req.params.reqId);
    if (!modReq) return res.status(404).json({ message: "Modification request not found" });

    const { action } = req.body;
    modReq.status = action === "resolved" ? "resolved" : "dismissed";
    await contract.save();

    const populated = await Contract.findById(contract._id).populate(populateFields).lean();
    res.json({ contract: populated });
  } catch (err) { next(err); }
}

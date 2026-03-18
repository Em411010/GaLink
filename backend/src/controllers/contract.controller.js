import Contract from "../models/Contract.model.js";

// GET /api/contracts/user/:userId — get contracts for a user (as hirer or freelancer)
export async function getUserContracts(req, res, next) {
  try {
    const { userId } = req.params;
    const contracts = await Contract.find({
      $or: [{ hirer: userId }, { freelancer: userId }],
    })
      .populate("hirer", "name profilePhoto")
      .populate("freelancer", "name profilePhoto")
      .populate("rating", "averageScore comment")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ contracts });
  } catch (err) {
    next(err);
  }
}

// POST /api/contracts — create a new contract (hirer only)
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
      title,
      description,
      skills: skills || [],
      amount: amount || 0,
      rateType: rateType || "",
      startDate: startDate || new Date(),
      endDate: endDate || null,
      status: "pending",
    });

    const populated = await Contract.findById(contract._id)
      .populate("hirer", "name profilePhoto")
      .populate("freelancer", "name profilePhoto")
      .lean();

    res.status(201).json({ contract: populated });
  } catch (err) {
    next(err);
  }
}

// PUT /api/contracts/:id/status — update contract status
export async function updateContractStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ["active", "completed", "cancelled", "disputed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const contract = await Contract.findById(id);
    if (!contract) return res.status(404).json({ message: "Contract not found" });

    // Only hirer or freelancer can update
    const userId = req.user._id.toString();
    if (contract.hirer.toString() !== userId && contract.freelancer.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    contract.status = status;
    if (status === "completed") contract.completedAt = new Date();
    await contract.save();

    const populated = await Contract.findById(id)
      .populate("hirer", "name profilePhoto")
      .populate("freelancer", "name profilePhoto")
      .populate("rating", "averageScore comment")
      .lean();

    res.json({ contract: populated });
  } catch (err) {
    next(err);
  }
}

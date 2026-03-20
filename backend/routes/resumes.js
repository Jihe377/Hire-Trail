import { Router } from "express";
import { ObjectId } from "mongodb";
import { getDB } from "../config/db.js";
import { ensureAuth } from "../middleware/auth.js";

const router = Router();

router.use(ensureAuth);

// GET all resumes for current user
router.get("/", async (req, res) => {
  try {
    const db = getDB();
    const resumes = await db
      .collection("resumes")
      .find({ userId: req.user._id.toString() })
      .sort({ createdAt: -1 })
      .toArray();

    // Attach usage count per resume
    const appCounts = await db
      .collection("applications")
      .aggregate([
        { $match: { userId: req.user._id.toString(), resumeId: { $ne: null } } },
        { $group: { _id: "$resumeId", count: { $sum: 1 } } },
      ])
      .toArray();

    const countMap = {};
    appCounts.forEach((item) => {
      countMap[item._id] = item.count;
    });

    const enriched = resumes.map((r) => ({
      ...r,
      applicationCount: countMap[r._id.toString()] || 0,
    }));

    return res.json(enriched);
  } catch (err) {
    console.error("Get resumes error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// GET single resume
router.get("/:id", async (req, res) => {
  try {
    const db = getDB();
    const resume = await db.collection("resumes").findOne({
      _id: new ObjectId(req.params.id),
      userId: req.user._id.toString(),
    });
    if (!resume) {
      return res.status(404).json({ error: "Resume not found" });
    }
    return res.json(resume);
  } catch (err) {
    console.error("Get resume error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// POST create resume
router.post("/", async (req, res) => {
  try {
    const { name, targetRole, fileName } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Resume name is required" });
    }

    const now = new Date();
    const newResume = {
      userId: req.user._id.toString(),
      name,
      targetRole: targetRole || "",
      fileName: fileName || "",
      uploadDate: now,
      createdAt: now,
      updatedAt: now,
    };

    const db = getDB();
    const result = await db.collection("resumes").insertOne(newResume);
    newResume._id = result.insertedId;
    return res.status(201).json(newResume);
  } catch (err) {
    console.error("Create resume error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// PUT update resume
router.put("/:id", async (req, res) => {
  try {
    const db = getDB();
    const existing = await db.collection("resumes").findOne({
      _id: new ObjectId(req.params.id),
      userId: req.user._id.toString(),
    });

    if (!existing) {
      return res.status(404).json({ error: "Resume not found" });
    }

    const { name, targetRole, fileName } = req.body;
    const updates = {
      name: name ?? existing.name,
      targetRole: targetRole ?? existing.targetRole,
      fileName: fileName ?? existing.fileName,
      updatedAt: new Date(),
    };

    await db
      .collection("resumes")
      .updateOne({ _id: new ObjectId(req.params.id) }, { $set: updates });

    const updated = await db
      .collection("resumes")
      .findOne({ _id: new ObjectId(req.params.id) });
    return res.json(updated);
  } catch (err) {
    console.error("Update resume error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// DELETE resume
router.delete("/:id", async (req, res) => {
  try {
    const db = getDB();
    const result = await db.collection("resumes").deleteOne({
      _id: new ObjectId(req.params.id),
      userId: req.user._id.toString(),
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Resume not found" });
    }

    return res.json({ message: "Resume deleted" });
  } catch (err) {
    console.error("Delete resume error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;

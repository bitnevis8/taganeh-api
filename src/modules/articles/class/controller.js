const Class = require('./model');

module.exports = {
  async getAll(req, res) {
    try {
      const classes = await Class.findAll();
      res.json({ data: classes });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async getOne(req, res) {
    try {
      const classItem = await Class.findByPk(req.params.id);
      if (!classItem) return res.status(404).json({ error: 'Class not found' });
      res.json({ data: classItem });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
  async create(req, res) {
    try {
      const classItem = await Class.create(req.body);
      res.status(201).json({ data: classItem });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async update(req, res) {
    try {
      const classItem = await Class.findByPk(req.params.id);
      if (!classItem) return res.status(404).json({ error: 'Class not found' });
      await classItem.update(req.body);
      res.json({ data: classItem });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },
  async remove(req, res) {
    try {
      const classItem = await Class.findByPk(req.params.id);
      if (!classItem) return res.status(404).json({ error: 'Class not found' });
      await classItem.destroy();
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}; 
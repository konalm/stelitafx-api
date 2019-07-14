const repo = require('./repository');


/**
 * Get all prototypes
 */
exports.getProtos = async (req, res) => {
  let protos;
  try {
    protos = await repo.getProtos;
  } catch (err) {
    return res.status(500).send(err);
  }

  return res.send(protos);
}

/**
 * Get a prototype
 */
exports.getProto = async (req, res) => {
  const id = req.params.id;

  let proto;
  try {
    proto = await repo.getProto(id);
  } catch (err) {
    return res.status(500).send('Error getting prototype');
  }

  if (!proto) return res.status(404).send(`no prototype found with id ${id}`);

  return res.send({
    prototypeNo: proto.prototype_no,
    dateCreated: proto.date_created,
    description: proto.description
  });
}

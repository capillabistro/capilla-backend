const fs = require("fs");

function verifyPremioCode(req, res) {
  try {
    const { premioCode } = req.params;
    const data = JSON.parse(fs.readFileSync("./db/db.json"));
    const code = data.find((code) => code.code == premioCode);
    if (code) {
      !code.used
        ? useCode(data, code, res)
        : res.status(400).json({ msg: "Ya fue utilizado" });
    } else {
      res.status(400).json({ msg: "El codigo no existe" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Error en servidor" });
  }
}

function useCode(data, code, res) {
  try {
    const newArr = data.filter((obj) => obj !== code);
    code.used = true;
    const newData = [...newArr, code];
    fs.writeFileSync("./db/db.json", JSON.stringify(newData));
    res.status(200).json({
      ok: true,
      msg: "Codigo canjeado con exito",
      prize: code.prize,
      expiration: code.expiration,
    });
  } catch (err) {
    console.log(err);
  }
}

module.exports = { verifyPremioCode };

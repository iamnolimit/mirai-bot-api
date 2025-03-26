const {
  getZodiac,
  artinama,
  artimimpi,
  nomorhoki,
} = require("@bochilteam/scraper-primbon");
const cheerio = require("cheerio");
const express = require("express");
const router = express.Router();
const { validateApiKey } = require('./member');

// Middleware for parsing JSON and API key validation
router.use(express.json());
router.use(validateApiKey);

/**
 * @swagger
 * tags:
 *   name: Primbon
 *   description: Primbon API - Indonesian traditional fortune telling
 */

// Zodiac route
/**
 * @swagger
 * /primbon/zodiak:
 *   post:
 *     summary: Get zodiac information by date
 *     tags: [Primbon]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - day
 *               - month
 *             properties:
 *               day:
 *                 type: integer
 *                 description: Day of birth
 *               month:
 *                 type: integer
 *                 description: Month of birth
 *     responses:
 *       200:
 *         description: Zodiac information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 result:
 *                   type: string
 *       400:
 *         description: Missing required parameters
 *       500:
 *         description: Server error
 */
router.post("/zodiak", async (req, res) => {
  try {
    const { day, month } = req.body;

    if (!day || !month) {
      return res.status(400).json({
        status: 400,
        result: "Day and month are required",
      });
    }

    const data = getZodiac(parseInt(month), parseInt(day));
    res.json({
      status: 200,
      result: data,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 500,
      result: "Server error",
    });
  }
});

// Artinama route
/**
 * @swagger
 * /primbon/artinama:
 *   post:
 *     summary: Get name meaning
 *     tags: [Primbon]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name to analyze
 *     responses:
 *       200:
 *         description: Name meaning
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 result:
 *                   type: object
 *       400:
 *         description: Missing required parameters
 *       500:
 *         description: Server error
 */
router.post("/artinama", async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        status: 400,
        result: "Name is required",
      });
    }

    const data = await artinama(name);
    res.json({
      status: 200,
      result: data,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 500,
      message: "Server error",
    });
  }
});

// Artimimpi route
/**
 * @swagger
 * /primbon/artimimpi:
 *   post:
 *     summary: Get dream meaning
 *     tags: [Primbon]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - dream
 *             properties:
 *               dream:
 *                 type: string
 *                 description: Dream to interpret
 *     responses:
 *       200:
 *         description: Dream meaning
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 result:
 *                   type: object
 *       400:
 *         description: Missing required parameters
 *       500:
 *         description: Server error
 */
router.post("/artimimpi", async (req, res) => {
  try {
    const { dream } = req.body;

    if (!dream) {
      return res.status(400).json({
        status: 400,
        result: "Dream is required",
      });
    }

    const data = await artimimpi(dream);
    res.json({
      status: 200,
      result: data,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 500,
      message: "Server error",
    });
  }
});

// Nomorhoki route
/**
 * @swagger
 * /primbon/nomorhoki:
 *   post:
 *     summary: Get lucky number information
 *     tags: [Primbon]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - number
 *             properties:
 *               number:
 *                 type: string
 *                 description: Number to analyze
 *     responses:
 *       200:
 *         description: Lucky number information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 result:
 *                   type: object
 *       400:
 *         description: Missing required parameters
 *       500:
 *         description: Server error
 */
// Nomorhoki route
router.post("/nomorhoki", async (req, res) => {
  try {
    const { number } = req.body;

    if (!number) {
      return res.status(400).json({
        status: 400,
        result: "Number is required",
      });
    }

    const data = await nomorhoki(number);
    res.json({
      status: 200,
      result: data,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 500,
      message: "Server error",
    });
  }
});

// Jodoh route
/**
 * @swagger
 * /primbon/jodoh:
 *   post:
 *     summary: Get match making prediction between two people
 *     tags: [Primbon]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nama1
 *               - nama2
 *               - tanggal_lahir1
 *               - tanggal_lahir2
 *             properties:
 *               nama1:
 *                 type: string
 *                 description: First person's name
 *               nama2:
 *                 type: string
 *                 description: Second person's name
 *               tanggal_lahir1:
 *                 type: string
 *                 description: First person's birth date (YYYY-MM-DD)
 *               tanggal_lahir2:
 *                 type: string
 *                 description: Second person's birth date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Match making prediction
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 result:
 *                   type: object
 *       400:
 *         description: Missing required parameters
 *       500:
 *         description: Server error
 */
// Jodoh route
const getFromPrimbon = async (props) => {
  const data = new URLSearchParams({ ...props, submit: 1 });
  const response = await fetch("https://www.primbon.com/ramalan_jodoh.php", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: data,
  });

  const html = await response.text();
  const $ = cheerio.load(html);

  let nama = [];
  let tanggalLahir = [];

  const body = $("#body").html();
  const content = body
    .slice(body.indexOf("begitu pula sebaliknya."))
    .replace("begitu pula sebaliknya.", "")
    .replace("<br><br>", "")
    .split("*Jangan mudah")[0];

  $("#body b").each((i, el) => {
    if (i < 2) {
      nama.push($(el).text());
    }
  });

  $("#body i").each((i, el) => {
    if (i < 2) {
      tanggalLahir.push($(el).text().split(": ")[1]);
    }
  });

  const identitas = {
    nama1: nama[0],
    nama2: nama[1],
    tanggal_lahir1: tanggalLahir[0],
    tanggal_lahir2: tanggalLahir[1],
  };

  const listprimbon = content.split("<b><i>").filter((item, i) => {
    if (i > 0) {
      return true;
    }
    return false;
  });

  const primbon = listprimbon.map((item) => {
    const list = item.slice(item.indexOf("Berdasarkan")).split("</i></b><br>");

    return {
      pasaran: list[0],
      detail: list[1].replace("<br><br>", "").replace("<i>", ""),
    };
  });

  return {
    identitas,
    primbon,
  };
};

const getPerjalananHidup = async (props) => {
  const data = new URLSearchParams({ ...props, submit: 1 });
  const response = await fetch("https://www.primbon.com/suami_istri.php", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: data,
  });

  const html = await response.text();
  const $ = cheerio.load(html);

  let perjalanan_hidup = [];

  $("#body table tr").each((i, el) => {
    const text = $(el).text().split(" Thn :");
    if (text[1]) {
      perjalanan_hidup.push({
        tahun: text[0].replace("\n", ""),
        detail: text[1],
      });
    }
  });

  return perjalanan_hidup;
};

const getRamalan = async (props) => {
  const data = new URLSearchParams({ ...props, submit: 1 });
  const response = await fetch("https://www.primbon.com/ramalan_cinta.php", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: data,
  });

  const html = await response.text();
  const $ = cheerio.load(html);

  const body = $("#body").html();

  const sisi_positif = body
    .split("Sisi Positif Anda:")[1]
    .split("<br>")[0]
    .replace("</b> ", "");
  const sisi_negatif = body
    .split("Sisi Negatif Anda:")[1]
    .split("<br>")[0]
    .replace("</b> ", "");
  const nilai = parseInt(
    body.split('src="ramalan_kecocokan_cinta')[1].split(".png")[0] || "0"
  );
  const nilai_detail = `${nilai}/5`;
  const sisi_detail = body.split('.png"><br><br>')[1].split("<table")[0];

  return {
    sisi_positif,
    sisi_negatif,
    sisi_detail,
    nilai,
    nilai_detail,
  };
};

router.post("/jodoh", async (req, res) => {
  try {
    const nama1 = req.body?.nama1;
    const nama2 = req.body?.nama2;
    const tanggalLahir1 = req.body?.tanggal_lahir1;
    const tanggalLahir2 = req.body?.tanggal_lahir2;

    if (!nama1 || !tanggalLahir1) {
      return res.status(400).json({
        status: 400,
        result: "Data diri anda tidak lengkap",
      });
    }

    if (!nama2 || !tanggalLahir2) {
      return res.status(400).json({
        status: 400,
        result: "Data diri pasangan anda tidak lengkap",
      });
    }

  const date1 = new Date(tanggalLahir1);
  const date2 = new Date(tanggalLahir2);

  const { identitas, primbon } = await getFromPrimbon({
    nama1,
    nama2,
    tgl1: date1.getDate(),
    bln1: date1.getMonth() + 1,
    thn1: date1.getFullYear(),
    tgl2: date2.getDate(),
    bln2: date2.getMonth() + 1,
    thn2: date2.getFullYear(),
  });

  const perjalanan_hidup = await getPerjalananHidup({
    nama1,
    nama2,
    tgl1: date1.getDate(),
    bln1: date1.getMonth() + 1,
    thn1: date1.getFullYear(),
    tgl2: date2.getDate(),
    bln2: date2.getMonth() + 1,
    thn2: date2.getFullYear(),
  });

  const ramalan = await getRamalan({
    nama1,
    nama2,
    tanggal1: date1.getDate(),
    bulan1: date1.getMonth() + 1,
    tahun1: date1.getFullYear(),
    tanggal2: date2.getDate(),
    bulan2: date2.getMonth() + 1,
    tahun2: date2.getFullYear(),
  });

  const result = {
    identitas,
    primbon,
    perjalanan_hidup,
    ramalan,
    primbon_nb:
      "Hasil ramalan primbon perjodohan bagi kedua pasangan yang dihitung berdasarkan 6 petung perjodohan dari kitab primbon Betaljemur Adammakna yang disusun oleh Kangjeng Pangeran Harya Tjakraningrat. Hasil ramalan bisa saja saling bertentangan pada setiap petung. Hasil ramalan yang positif (baik) dapat mengurangi pengaruh ramalan yang negatif (buruk), begitu pula sebaliknya.",
    perjalanan_hidup_nb:
      "Hasil ramalan tentu saja ada yang baik, ada yang buruk. Bagi yang kebetulan berada disituasi yang buruk atau kurang baik, disarankan untuk tetap berusaha menjaga keutuhan rumah tangga atau keluarga anda. Jalin komunikasi yang baik, perbanyak amal, rajin berdoa, tetap optimis dan tetap semangat dalam menjalani hidup. Hal tersebut akan memperbaiki karma anda.",
  };
  
  return res.json({
    status: 200,
    result
  });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: 500,
      result: "Server error",
    });
  }
});

module.exports = router;

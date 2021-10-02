const Router = require('express-promise-router');

const db = require('../db');

const router = Router();

module.exports = router;

router.get('/:product_id/styles', async (req, res) => {
  const id = req.params.product_id;

  const text = `SELECT
  product_id, json_agg(json_build_object(
    'style_id', style_id,
    'name', name,
    'sale_price', sale_price,
    'original_price', original_price,
    'default?', "default?",
    'photos',
    (SELECT json_agg(json_build_object(
        'thumbnail_url', thumbnail_url,
        'url', url
      )) FROM photos WHERE style_id = styles.style_id),
  'skus',
    (SELECT
        json_object_agg(id,
            json_build_object(
          'size', size,
          'quantity', quantity
            )
        ) as skus
      FROM skus
      WHERE style_id = styles.style_id
          GROUP by style_id)
  )) as results FROM styles
      WHERE styles.product_id = $1
        GROUP BY product_id`;
  const values = [id];

  try {
    const { rows } = await db.query(text, values);
    res.send(rows);
  } catch (err) {
    console.log(err.stack);
  }
});

// layout of each styles object
// top level: product_id: string id, results: []

// inside results array, each object contains:
// style_id,
// name,
// original_price,
// sale_price,
// default_style,
// photos: [] an array of objects, each object contains a thumbnail_url and a url
// skus: {} an object of objects
// each inner sku object contains: sku_num: {quantity: 3, size: xs}

const db = require('../util/db');
const { pagination } = require('../util/page');

const page_name = 'Tovar';
const table = 'tovar';
const fields = '(nazov,cenanak,cenapredaj,mnozstvo,ID_typt) VALUES (?,?,?,?,?)';
const fieldsAll = '(ct,nazov,cenanak,cenapredaj,mnozstvo,ID_typt) VALUES (?,?,?,?,?,?)';
const columns = [{
  name: '#',
  col_name: 'id'
}, {
  name: 'Názov',
  col_name: 'nazov'
}, {
  name: 'Pezinok (ks)',
  col_name: 'kauflandpezinok'
}, {
    name: 'Poprad (ks)',
    col_name: 'kauflandpoprad'
}, {
    name: 'Kosice (ks)',
    col_name: 'kauflandkosice'
}, {
  name: 'Spolu (ks)',
  col_name: 'spolu'
}];
const actions = [{
  path: 'view',
  name: 'View',
  icon: 'bi-eye'
}];

// List stock
exports.list = (req, res) => {
    let page =  req.query.page > 0 ? req.query.page : 1;
    let searchTerm = req.query.search ? req.query.search : '';
    let type = req.query.type;
    let query = `SELECT * FROM ${table} WHERE ID_typt = ? AND nazov LIKE ? ORDER BY ct LIMIT 25 OFFSET ?`;
    let variables = [type, `%${searchTerm}%`, (page-1) * 25];
    if(!type){
        query = `SELECT * FROM ${table} WHERE nazov LIKE ? ORDER BY ct LIMIT 25 OFFSET ?`;
        variables = [`%${searchTerm}%`, (page-1) * 25];
    }
    db.queryStock(query, variables, table, (rows) => {
        db.query('SELECT * FROM typtovaru', [], 'typtovaru', (rows2) => {
            let types = {};
            for(let row of rows2){
                types[row.ID_typt] = row.nazovt;
            }
            let data = [];
            for(let ct in rows){
                data.push({ ...rows[ct], id: ct });
            }
            console.log(data);
            res.render('list', { rows: data, columns, table, pages: pagination(page, rows.length === 26), actions, page_name, filters: [{ type: 'text', name: 'search', placeholder: 'Search'}, { type: 'select', name: 'type', placeholder: 'Typ', options: types}] });
        });
    });
}

exports.view = (req, res) => {
    db.queryStock(`SELECT * FROM ${table} WHERE ct = ?`, [req.params.id], table, (rows) => {
        let row = rows[Object.keys(rows)[0]];
        db.query('SELECT * FROM typtovaru WHERE ID_typt = ?', [row.ID_typt], 'typtovaru', (rows2) => {
            res.render('view', { page_name, table, columns: [...columns, { name: 'Typ', col_name: 'typ' }], extras: [{ name: 'Popis typu', col_name: 'typ_popis' }], data: { ...row, id: req.params.id, typ: rows2[0].nazovt, typ_popis: rows2[0].popis} });
        },errorHandler(res));
    });
}

exports.add = (req, res) => {
    const { db_name, nazov, cenanak, cenapredaj, mnozstvo, ID_typt } = req.body;
    db.query(`INSERT INTO ${table} ${fields}`, [nazov, cenanak, cenapredaj, 0, ID_typt], table, (rows) => {
        db.query(`SELECT * FROM ${table} WHERE nazov=? AND cenanak=? AND cenapredaj=? AND mnozstvo=? AND ID_typt=?`, [nazov, cenanak, cenapredaj, 0, ID_typt], [nazov, ID_typt], (rows) => {
            console.log(db_name);
            db.queryAll(db_name, `INSERT INTO ${table} ${fieldsAll}`, [rows[0].ct, nazov, cenanak, cenapredaj, mnozstvo, ID_typt], [rows[0].ct, nazov, cenanak, cenapredaj, 0, ID_typt], table, (rows) => {
                res.send('SUCCESS');
            });
        });
    });
}
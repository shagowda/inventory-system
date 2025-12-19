const bcrypt = require('bcryptjs');

async function hash() {
    const h = await bcrypt.hash('admin123', 10);
    console.log(h);
}

hash();
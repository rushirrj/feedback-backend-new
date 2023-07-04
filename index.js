const express = require('express');
const cors = require('cors');

const connectDB = require('./configs/connectDB');
const userController = require('./controllers/userController');
const productController = require('./controllers/productController');

const app = express();
app.use(express.json());
app.use(cors());

const port = process.env.PORT || 8000;
connectDB();

app.get('/', (req, res) => res.send('Backend working'));
app.get('/post', (req, res) => res.send('post working'));


app.post('/user/register', async (req, res) => {
    const { registerUser } = userController;
    const result = await registerUser(req.body);
    if (result.success) {
        res.send({
            success: true,
            message: result.message
        });
    }
    else {
        res.send({
            success: false,
            message: result.message
        });
    }

})

app.post('/user/login', async (req, res) => {
    const { loginUser } = userController;
    const result = await loginUser(req.body);
    if (result.success) {
        res.send({
            success: true,
            token: result.token
        })
    }
    else {
        res.send({
            success: false,
            message: result.message
        })
    }
})

app.post('/product/add', async (req, res) => {
    let token = req.headers.authorization;
    const { product_name, logo_url, product_link, product_description, product_category } = req.body;

    const { addProduct } = productController;

    const result = await addProduct({
        token, product_name, logo_url, product_link, product_description, product_category
    });
    console.log(result);
    if (result.success) {
        res.send({
            success: true,
            message: result.message
        });
    }
    else {
        res.send({
            success: false,
            message: result.message
        });
    }
})

app.get('/product/view', async (req, res) => {
    const { sort, product_category } = req.query;
    const { getProducts } = productController;

    const result = await getProducts(product_category, sort);
    if (result.success) {
        res.send({
            success: true,
            data: result.data
        });
    }
    else {
        res.status(400).send({
            success: false,
            message: result.message
        });
    }
})

app.patch('/product/comment/:id', async (req, res) => {
    const productId = req.params.id;
    const comment = req.body.comment;
    const { addComment } = productController;

    const result = await addComment({ productId, comment });
    if (result.success) {
        res.send({
            success: true,
            message: result.message
        });
    }
    else {
        res.status(400).send({
            success: false,
            message: result.message
        });
    }
})

app.patch('/product/like/:id', async (req, res) => {
    const productId = req.params.id;
    const { addLike } = productController;
    const result = await addLike({ productId });
    if (result.success) {
        res.send({
            success: true,
            message: result.message
        })
    } else {
        res.status(400).send({
            success: false,
            message: result.message
        })
    }
})

app.patch('/product/edit/:id', async (req, res) => {
    const productId = req.params.id;
    const token = req.headers.authorization;
    const { product_name, logo_url, product_link, product_description, product_category } = req.body;
    const {editProductDetails} = productController;

    const result = await editProductDetails({token, productId,product_name, logo_url, product_link, product_description, product_category });
    if (result.success) {
        res.send({
            success: true,
            message: result.message
        })
    } else {
        res.status(400).send({
            success: false,
            message: result.message
        })
    }
})

app.listen(port, () => {
    console.log('listening to port:', port);
})

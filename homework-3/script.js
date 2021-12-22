const API_URL = 'https://raw.githubusercontent.com/GeekBrainsTutorial/online-store-api/master/responses/';

function send(onError, onSuccess, url, method = 'GET', data = '', headers = {}, timeout = 60000) {

  let xhr;

  if (window.XMLHttpRequest) {
    // Chrome, Mozilla, Opera, Safari
    xhr = new XMLHttpRequest();
  } else if (window.ActiveXObject) {
    // Internet Explorer
    xhr = new ActiveXObject("Microsoft.XMLHTTP");
  }

  for ([key, value] of Object.entries(headers)) {
    xhr.setRequestHeader(key, value)
  }

  xhr.timeout = timeout;

  xhr.ontimeout = onError;

  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.status < 400) {
        onSuccess(xhr.responseText)
      } else if (xhr.status >= 400) {
        onError(xhr.status)
      }
    }
  }

  xhr.open(method, url, true);

  xhr.send(data);
}


function getCounter() {
  let last = 0;

  return () => ++last;
}

const stackIDGenrator = getCounter();

class Product {
  constructor({
    id,
    title,
    price
  }) {
    this.id = id;
    this.title = title;
    this.price = price;
  }

  getId() {
    return this.id;
  }

  getPrice() {
    return this.price;
  }

  getTitle() {
    return this.title;
  }
}

class ProductStack {
  constructor(product) {
    this.id = stackIDGenrator();
    this.product = product;
    this.count = 1;
  }

  getProductId() {
    return this.product.id;
  }

  getProduct() {
    return this.product;
  }

  getCount() {
    return this.count;
  }

  add() {
    this.count++;
    return this.count;
  }

  remove() {
    this.count--;
    return this.count;
  }
  delete() {
    this.count = 0;
    return this.count;
  }
}

class Basket {
  constructor(product, drawBasket) {
    this.list = [];
    this.product = product;
    this.drawBasket = drawBasket;
  }

  addServer(product) {
    send(this._onError, response => {
      const data = JSON.parse(response);

      if (+data.result === 1) {
        this.add(product);
      }
    }, `${API_URL}addToBasket.json`);
  }

  delFromServer(product, remove) {
    send(this._onError, response => {
      const data = JSON.parse(response);

      if (+data.result === 1) {
        this.remove(product, remove)
      }
    }, `${API_URL}deleteFromBasket.json`);
  }

  fetchGoods() {
    send(this._onError, response => {
      const data = JSON.parse(response);

      if (data.contents.length > 0) {
        data.contents.forEach(({
          id_product,
          product_name,
          price,
          quality
        }) => this.add({
          id: id_product,
          title: product_name,
          price: price,
          quality: quality,
        }, quality));
      }
    }, `${API_URL}getBasket.json`);

  }

  _onError(err) {
    console.log(err);
  }

  add(product, quality) {
    const idx = this.list.findIndex((stack) => stack.getProductId() == product.id);

    if (idx >= 0) {
      this.list[idx].add();
    } else {
      this.list.push(new ProductStack(product, quality));
    }
  }

  remove(id) {
    const idx = this.list.findIndex((stack) => stack.getProductId() == id);

    if (idx >= 0) {
      this.list[idx].remove();

      if (this.list[idx].getCount() <= 0) {
        this.list.splice(idx, 1);
      }
    }

  }

  delete(id) {
    const idx = this.list.findIndex((stack) => stack.getProductId() == id);

    if (idx >= 0) {
      this.list[idx].delete();
    }

  }

}

class Showcase {
  constructor(basket) {
    this.list = [];
    this.basket = basket;
  }

  _onSuccess(response) {
    const data = JSON.parse(response)

    data.forEach(product => {
      this.list.push(
        new Product({
          id: product.id_product,
          title: product.product_name,
          price: product.price
        })
      )
    });
  }

  _onError(err) {
    console.log(err);
  }

  fetchGoods() {
    send(this._onError, this._onSuccess.bind(this), `${API_URL}catalogData.json`);
  }

  addToCart(id) {
    const idx = this.list.findIndex((product) => id == product.id);

    if (idx >= 0) {
      this.basket.add(this.list[idx]);
    }
  }
}

class RenderProductInShowcase {
  constructor({
    id,
    title,
    price
  }) {
    this.id = id;
    this.title = title;
    this.price = price;
  }

  renderProductsShowcase() {
    return `
        <ul class="showcase__list" data-id="${this.id}">
        <li class="showcase__item item-title">${this.title}</li>
        <li class="showcase__item item-price">$ ${this.price}</li>
        <li class='showcase__item item-btn'><button data-id="${this.id}" class='showcase__button'>Add to cart</button></li>
        </ul>
        `;
  }
}

class RenderProductInBasket {
  constructor({
    count,
    product: {
      id,
      price,
      title
    }
  }) {
    this.id = id;
    this.count = count;
    this.price = price;
    this.title = title;
  }

  renderProductsItemInBasket() {
    return `
          <ul class="product__list" data-id="${this.id}">
            <li class="product__item">${this.title}</li>
            <li class="product__item"><button class="btn-countMin">&#8722;</button><span class="product__item-count">${this.count}</span><button class="btn-countPl">&#43;</button></li>
            <li class="product__item">$ ${this.price}</li>
            <li class="product__item">$ ${this.count * this.price}</li>
            <li class="product__item"><button class="delete-btn">&#215;</button></li>
          </ul>
        `;
  }
}

class RenderShowcase {
  constructor() {
    this.productsList = '';
    this.showCaseEl = document.querySelector('.showcase');
  }
  renderProductsList() {
    this.productsList = this.products.map(item => {
      let product = new RenderProductInShowcase(item);

      return product.renderProductsShowcase();
    }).join('');
  }
  addToProductInShowcase() {
    this.showCaseEl.insertAdjacentHTML("beforeend", this.productsList);
  }
  reloadShowcase(products) {
    this.products = products.list;
    this.renderProductsList();
    this.addToProductInShowcase();
  }
}

class RenderProductsListInBasket {
  constructor() {
    this.productsList = '';
    this.basketEl = document.querySelector('.total__list');
    this.basketStr = document.getElementsByClassName('product__list');
  }
  renderProductsList() {
    this.productsList = this.products.map(item => {
      let product = new RenderProductInBasket(item);

      return product.renderProductsItemInBasket();
    }).join('');
  }
  clearBasket() {
    if (this.basketStr) {
      [...this.basketStr].forEach(basketStr => basketStr.remove());
    }
  }
  addToProductInBasket() {
    this.basketEl.insertAdjacentHTML("beforebegin", this.productsList);
  }
  reloadBasket(products) {
    this.products = products.list;
    this.clearBasket();
    this.renderProductsList();
    this.addToProductInBasket();
  }
}

class RenderTotalProductInBasket {
  constructor() {
    this.productsCount = '';
    this.totalCount = document.querySelector('.basket__button-span');
  }
  renderTotalProducts(products) {
    this.productsCount = Object.values(products.list).reduce((acc, product) => acc + product.count, 0)
    this.totalCount.innerHTML = this.productsCount;
  }
}

class RenderTotalProductPrice {
  constructor() {
    this.totalPrice = '';
    this.paid = document.querySelector('.total__item-span');
  }
  renderTotalPrice(products) {
    this.totalPrice = Object.values(products.list).reduce((acc, product) => acc + product.product.price * product.count, 0);
    this.paid.innerHTML = `$ ${this.totalPrice}`;
  }
}

const basket = new Basket();
const showcase = new Showcase(basket);
const drawShowcase = new RenderShowcase();
const drawBasket = new RenderProductsListInBasket();
const totalPaid = new RenderTotalProductPrice();
const totalProductsInBasket = new RenderTotalProductInBasket();
showcase.fetchGoods();
basket.fetchGoods(drawBasket);

setTimeout(() => {
  drawShowcase.reloadShowcase(showcase);
  drawBasket.reloadBasket(basket);
  totalProductsInBasket.renderTotalProducts(basket);
  totalPaid.renderTotalPrice(basket);

}, 1000)

const basketButton = document.querySelector('header');
const buttonsBasket = document.querySelector('.basket');
const buttonEls = document.querySelector('.showcase');

basketButton.addEventListener('click', (event) => {
  if (!event.target.closest(".basket__button")) {
    return;
  }

  buttonsBasket.classList.toggle('hidden');
});

buttonEls.addEventListener('click', (event) => {
  if (!event.target.closest(".showcase__button")) {
    return;
  }

  showcase.addToCart(event.target.dataset.id);
  drawBasket.reloadBasket(basket);
  totalPaid.renderTotalPrice(basket);
  totalProductsInBasket.renderTotalProducts(basket);
});

buttonsBasket.addEventListener('click', (event) => {
  const buttons = event.target.closest('.product__list');
  if (event.target.classList.contains('btn-countMin')) {
    basket.remove(buttons.dataset.id);
  }
  if (event.target.classList.contains('btn-countPl')) {
    showcase.addToCart(buttons.dataset.id);
  }
  if (event.target.classList.contains('delete-btn')) {
    basket.delete(buttons.dataset.id);
    basket.remove(buttons.dataset.id);
  }

  drawBasket.reloadBasket(basket);
  totalPaid.renderTotalPrice(basket);
  totalProductsInBasket.renderTotalProducts(basket);
});
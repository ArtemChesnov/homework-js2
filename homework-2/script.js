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
    return this.product.id
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
  constructor() {
    this.list = [];
  }

  add(product) {
    const idx = this.list.findIndex((stack) => stack.getProductId() == product.id)

    if (idx >= 0) {
      this.list[idx].add();
    } else {
      this.list.push(new ProductStack(product));
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

  fetchGoods() {
    this.list = [
      new Product({
        id: 1,
        title: 'T-shirt',
        price: 140
      }),
      new Product({
        id: 2,
        title: 'Trousers',
        price: 320
      }),
      new Product({
        id: 3,
        title: 'Tie',
        price: 24
      })
    ]

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
drawShowcase.reloadShowcase(showcase);
totalProductsInBasket.renderTotalProducts(basket);

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
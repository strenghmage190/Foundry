export class SystemItem extends Item {
  /*
    Beyonders Item subclass to provide convenience helpers for items.
  */

  get price() {
    return this.system.price;
  }

  get isFree() {
    return this.price < 1;
  }
}

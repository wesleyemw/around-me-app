export function uuid() {
  let random = window.crypto.randomUUID();
  let randomArr = random.split("-");
  let uuid = "".concat(...randomArr).slice(12);
  return uuid;
}

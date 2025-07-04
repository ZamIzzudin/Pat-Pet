/** @format */

export default (() => {
  function GridParse(value: number) {
    return value * 16;
  }

  function CharCoordinate(x: number, y: number) {
    return { x: GridParse(x), y: GridParse(y) };
  }

  return {
    GridParse,
    CharCoordinate,
  };
})();

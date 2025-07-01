/** @format */

export default (() => {
  function GridParse(value: number) {
    return value * 16;
  }

  function CharCoordinate(x: number, y: number) {
    return { x: GridParse(x) - 8, y: GridParse(y) - 18 };
  }

  return {
    GridParse,
    CharCoordinate,
  };
})();

export { AsynHandler };
const AsynHandler = (requestHandler) => (req, res, Next) => {
  Promise.resolve(requestHandler(req, res, Next)).catch((err) => Next(err));
};

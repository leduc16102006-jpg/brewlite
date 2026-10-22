const AuthGuard = () => class {
  canActivate() {
    return true;
  }
};

const PassportStrategy = (Strategy, name) => class {};

module.exports = {
  __esModule: true,
  AuthGuard,
  PassportStrategy,
  default: {},
};
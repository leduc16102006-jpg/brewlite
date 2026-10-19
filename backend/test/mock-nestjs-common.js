class HttpException extends Error {
  constructor(response, status = 500) {
    super(typeof response === 'string' ? response : (response?.message || 'Http Exception'));
    this.response = response;
    this.status = status;
  }
}

class BadRequestException extends HttpException {
  constructor(message = 'Bad Request') {
    super(message, 400);
    this.name = 'BadRequestException';
  }
}

class NotFoundException extends HttpException {
  constructor(message = 'Not Found') {
    super(message, 404);
    this.name = 'NotFoundException';
  }
}

class UnauthorizedException extends HttpException {
  constructor(message = 'Unauthorized') {
    super(message, 401);
    this.name = 'UnauthorizedException';
  }
}

class ForbiddenException extends HttpException {
  constructor(message = 'Forbidden') {
    super(message, 403);
    this.name = 'ForbiddenException';
  }
}

const Injectable = () => (target) => target;

module.exports = {
  __esModule: true,
  HttpException,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
  Injectable,
  default: {},
};
// Decorator tổng quát cho class, method và parameter
const decorator = () => (target, propertyKey, descriptor) => descriptor || target;

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

class ConflictException extends HttpException {
  constructor(message = 'Conflict') {
    super(message, 409);
    this.name = 'ConflictException';
  }
}

class ParseIntPipe {
  transform(value) {
    return parseInt(value, 10);
  }
}

module.exports = {
  __esModule: true,
  HttpException,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
  ConflictException,
  Injectable: decorator,
  Controller: decorator,
  Get: decorator,
  Post: decorator,
  Patch: decorator,
  Put: decorator,
  Delete: decorator,
  Body: decorator,
  Param: decorator,
  Req: decorator,
  Res: decorator,
  Headers: decorator,
  UseGuards: decorator,
  ParseIntPipe,
  default: {},
};

class Logger {
  log() {}
  error() {}
  warn() {}
  debug() {}
  verbose() {}
}

class ConsoleLogger extends Logger {}

// Thêm Logger và ConsoleLogger vào module.exports:
module.exports = {
  // ... các thành phần cũ giữ nguyên
  Logger,
  ConsoleLogger,
};
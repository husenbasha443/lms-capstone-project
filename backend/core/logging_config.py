import logging
import sys
from loguru import logger

from backend.core.config import settings


class InterceptHandler(logging.Handler):
    def emit(self, record: logging.LogRecord) -> None:
        try:
            level = logger.level(record.levelname).name
        except ValueError:
            level = record.levelno

        logger.opt(
            depth=6,
            exception=record.exc_info,
        ).log(level, record.getMessage())


def configure_logging() -> None:
    logging.basicConfig(handlers=[InterceptHandler()], level=logging.INFO)

    logger.remove()
    logger.add(
        sys.stdout,
        level=settings.log_level.upper(),
        format="<green>{time}</green> | <level>{level}</level> | "
        "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - "
        "<level>{message}</level>",
        backtrace=True,
        diagnose=settings.environment != "production",
    )


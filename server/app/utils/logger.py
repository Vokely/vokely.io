import logging
import sys
import json
from colorlog import ColoredFormatter


class SmartFormatter(logging.Formatter):
    def __init__(self):
        # Two formatters: one for text, one for JSON
        self.text_formatter = ColoredFormatter(
            "%(log_color)s%(levelname)s [%(filename)s:%(lineno)d]%(reset)s: %(message)s",
            log_colors={
                'DEBUG': 'cyan',
                'INFO': 'green',
                'WARNING': 'yellow',
                'ERROR': 'red',
                'CRITICAL': 'bold_red',
            }
        )
        super().__init__()

    def format(self, record):
        if isinstance(record.msg, dict):
            record.msg = json.dumps(record.msg, indent=2)
        return self.text_formatter.format(record)


# Setup logger
logger = logging.getLogger("app_logger")
logger.setLevel(logging.DEBUG)

# Clear handlers to avoid duplicates
logger.handlers = []

# Create stream handler with SmartFormatter
stream_handler = logging.StreamHandler(sys.stdout)
stream_handler.setFormatter(SmartFormatter())

logger.addHandler(stream_handler)
logger.propagate = False
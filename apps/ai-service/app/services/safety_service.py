from typing import Any


SENSITIVE_KEYS = {"password", "token", "jwt", "secret", "dni", "documentNumber", "email", "phone"}


class SafetyService:
    def sanitize_context(self, value: Any) -> Any:
        if isinstance(value, dict):
            sanitized: dict[str, Any] = {}
            for key, item in value.items():
                if self._is_sensitive_key(key):
                    sanitized[key] = "[REDACTED]"
                else:
                    sanitized[key] = self.sanitize_context(item)
            return sanitized
        if isinstance(value, list):
            return [self.sanitize_context(item) for item in value[:80]]
        return value

    def _is_sensitive_key(self, key: str) -> bool:
        normalized = key.lower()
        return any(sensitive.lower() in normalized for sensitive in SENSITIVE_KEYS)

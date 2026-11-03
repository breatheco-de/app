#!/usr/bin/env python3
"""
Smoke test for the 4geeks LiteLLM proxy.

The litellm Python SDK parses model prefixes as providers (e.g. "madrid-spain/...").
When calling a remote proxy, requests must go through the OpenAI-compatible API.

Usage (PowerShell):
  pip install litellm
  $env:LITELLM_API_KEY = "sk-your-virtual-key"
  $env:LITELLM_API_BASE = "https://llm.4geeks.ai"
  $env:LITELLM_MODEL = "madrid-spain/openrouter/deepseek/deepseek-v3.2"
  python scripts/test_litellm_proxy.py

Usage (bash):
  pip install litellm
  export LITELLM_API_KEY="sk-your-virtual-key"
  python scripts/test_litellm_proxy.py
"""

from __future__ import annotations

import os
import sys

try:
    import litellm
except ImportError:
    print("Install dependencies: pip install litellm", file=sys.stderr)
    sys.exit(1)


def proxy_api_base(base_url: str) -> str:
    """LiteLLM proxy expects OpenAI-compatible /v1 endpoints."""
    base = base_url.rstrip("/")
    if base.endswith("/v1"):
        return base
    return f"{base}/v1"


def main() -> int:
    api_key = "sk-KcBnWY0a3q7sJVNzId85dQ"
    if not api_key:
        print("Missing LITELLM_API_KEY (use a virtual key, not the master key).", file=sys.stderr)
        return 1

    api_base = proxy_api_base(os.environ.get("LITELLM_API_BASE", "https://llm.4geeks.ai"))
    model = os.environ.get(
        "LITELLM_MODEL",
        "madrid-spain/openrouter/xiaomi/mimo-v2.5",
    )
    prompt = os.environ.get("LITELLM_PROMPT", "Explain how to use LiteLLM sdk (long explanation)")

    print(f"Base URL: {api_base}")
    print(f"Model:    {model}")
    print("Sending request...")

    try:
        response = litellm.completion(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            api_base=api_base,
            api_key=api_key,
            custom_llm_provider="openai",
        )
    except Exception as exc:
        print(f"Request failed: {exc}", file=sys.stderr)
        return 1

    content = response.choices[0].message.content
    print("\nResponse:")
    print(content)

    usage = getattr(response, "usage", None)
    if usage:
        print("\nUsage:", dict(usage) if hasattr(usage, "__iter__") else usage)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
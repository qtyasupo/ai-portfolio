import importlib.util
from pathlib import Path
import sys
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT/"scripts"))
spec = importlib.util.spec_from_file_location("collect_news", ROOT/"scripts/collect-news.py")
news = importlib.util.module_from_spec(spec)
spec.loader.exec_module(news)

class NewsMonitorTest(unittest.TestCase):
    def test_timeline_only_keeps_enabled_following_authors(self):
        rows = [{"author": name, "title": "OpenAI AI model", "url": f"https://x.com/{name}/status/{n}"} for n, name in enumerate(["known", "outside", "paused"], 100)]
        accounts = [{"handle": "known", "enabled": True, "confirmed": True}, {"handle": "paused", "enabled": False, "confirmed": True}]
        items = news.eligible_rows(rows, accounts)
        self.assertEqual(len(items), 1)
        self.assertEqual(items[0]["publisherId"], "x:known")
        self.assertEqual(items[0]["stream"], "news")

    def test_creative_workflows_and_model_releases_are_separated(self):
        accounts = [{"handle": "known", "enabled": True, "confirmed": True}]
        rows = [{"author": "known", "title": title, "url": f"https://x.com/known/status/{n}"} for n, title in enumerate(["AI video animation workflow", "OpenAI announces new model for AI video"], 100)]
        self.assertEqual([i["stream"] for i in news.eligible_rows(rows, accounts)], ["creation", "news"])

    def test_restricted_read_is_recorded_once_without_retry(self):
        import tempfile
        for code in ["NEED_LOGIN", "PLATFORM_BLOCKED", "RATE_LIMITED", "TIMEOUT"]:
            with self.subTest(code=code), tempfile.TemporaryDirectory(dir=ROOT/".radar") as folder:
                self.assertTrue(Path(folder).resolve().is_relative_to((ROOT/".radar").resolve()))
                with patch.object(news, "STATE", Path(folder)), patch.object(news, "load_config", return_value={"accounts": [{"handle": "known", "enabled": True, "confirmed": True}]}), patch.object(news, "run_json", return_value={"ok": False, "error": {"code": code, "message": "stop"}}) as read, patch.object(news, "js_ingest") as save:
                    self.assertFalse(news.collect_once())
                    self.assertEqual(read.call_count, 1)
                    self.assertEqual(save.call_args.args[0]["error"]["code"], code)

if __name__ == "__main__": unittest.main()

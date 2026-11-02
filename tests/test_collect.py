import json
from pathlib import Path
import sys
import tempfile
from types import SimpleNamespace
import unittest
from unittest.mock import patch

ROOT=Path(__file__).resolve().parent.parent
sys.path.insert(0,str(ROOT/"scripts"))
import collect

class CollectionStopTest(unittest.TestCase):
    def test_detail_challenge_stops_same_platform_and_keeps_search_evidence(self):
        source={"platform":"youtube","enabled":True,"state":"ok","queries":["AI video"],"cursor":0,"lastSuccessAt":"2026-11-01T00:00:00Z"}
        rows=[{"url":f"https://www.youtube.com/watch?v={video}","title":"AI animation workflow","text":"Public search text"} for video in ["abcdefghijk","bbcdefghijk","cccdefghijk"]]
        for code in ["PLATFORM_BLOCKED","NEED_LOGIN","RATE_LIMITED","TIMEOUT"]:
            with self.subTest(code=code),tempfile.TemporaryDirectory(dir=ROOT/".radar") as temp:
                # All test writes remain in this project's ignored scratch area.
                self.assertTrue(Path(temp).resolve().is_relative_to((ROOT/".radar").resolve()))
                with patch.object(collect,"STATE",Path(temp)),patch.object(collect,"config",return_value=[source]),patch.object(collect,"run_json",side_effect=[{"ok":True,"items":rows},{"ok":False,"error":{"code":code,"message":"stopped"}}]) as upstream,patch.object(collect,"js_ingest") as save,patch.object(collect.subprocess,"run"):
                    collect.collect_once(SimpleNamespace(platform=["youtube"],query=None,limit=3,enrich_existing=False))
                    self.assertEqual(upstream.call_count,2) # Search + first detail; no later requests.
                    self.assertEqual(len(save.call_args_list[0].args[0]["items"]),3)
                    self.assertEqual(save.call_args_list[-1].args[0]["error"]["code"],code)
                    receipt=json.loads((Path(temp)/"collector-result.json").read_text(encoding="utf-8"))
                    self.assertEqual(receipt["platforms"][0]["status"],"partial")

if __name__=="__main__":unittest.main()

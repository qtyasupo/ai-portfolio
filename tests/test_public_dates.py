import sys
import unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parent.parent/"scripts"))
from public_dates import parse_public_date

AT="2026-11-02T08:00:00Z"
class PublicDatesTest(unittest.TestCase):
    def test_douyin_own_publish_label(self):
        self.assertEqual(parse_public_date({"dates":[{"text":"发布时间：2026-11-01 10:48"}]},AT)[:2],("2026-11-01T10:48:00+08:00","minute"))
    def test_relative_note_date_uses_observation_timezone(self):
        self.assertEqual(parse_public_date({"dates":[{"text":"23分钟前 安徽"}]},AT)[:2],("2026-11-02T15:37:00+08:00","minute"))
    def test_yesterday_is_calendar_day(self):
        self.assertEqual(parse_public_date({"dates":[{"text":"昨天 23:20 广东"}]},AT)[:2],("2026-11-01T00:00:00+08:00","day"))
    def test_unknown_year_edited_invalid_or_future_is_not_promoted(self):
        for raw in ["10-31 上海","编辑于 2026-11-01","2026-02-30","2027-01-01","2026-11-03 08:00"]:
            with self.subTest(raw=raw):self.assertIsNone(parse_public_date({"dates":[{"text":raw}]},AT)[0])
    def test_explicit_metadata_timezone_kept(self):
        value=parse_public_date({"meta":[{"name":"article:published_time","content":"2026-11-01T12:00:00Z"}]},AT)
        self.assertEqual(value[0],"2026-11-01T12:00:00+00:00")
    def test_empty_details_do_not_invent_a_date(self):
        self.assertIsNone(parse_public_date({"meta":[],"dates":[]},AT)[0])
if __name__=="__main__":unittest.main()

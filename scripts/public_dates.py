"""Conservative parsing of dates actually displayed in a post's own public metadata."""
from datetime import datetime, timedelta, timezone
import re

CHINA=timezone(timedelta(hours=8))

def parse_public_date(data, observed_at):
    observed=datetime.fromisoformat(observed_at.replace("Z","+00:00")).astimezone(CHINA)
    candidates=[str(r.get("content") or "") for r in data.get("meta",[]) if str(r.get("name") or "").lower() in {"article:published_time","datepublished","publishdate","pubdate"}]
    candidates.extend(str(r.get("text") or "") for r in data.get("dates",[]))
    for raw in candidates:
        # Edited timestamps are not publication evidence.
        if "编辑" in raw:continue
        try:
            full=re.search(r"(20\d{2})[-/.年](\d{1,2})[-/.月](\d{1,2})日?(?:[ T]+(\d{1,2}):(\d{2})(?::(\d{2}))?)?",raw)
            if full:
                year,month,day,hour,minute,second=full.groups()
                value=datetime(int(year),int(month),int(day),int(hour or 0),int(minute or 0),int(second or 0),tzinfo=CHINA)
                # Respect explicit timezone on machine-readable metadata.
                if re.search(r"(?:Z|[+-]\d{2}:\d{2})$",raw):value=datetime.fromisoformat(raw.replace("Z","+00:00"))
                if value>observed+timedelta(minutes=5):continue
                return value.isoformat(),("second" if second else "minute" if hour else "day"),raw
            relative=re.match(r"^(\d+)\s*(分钟|小时|天)前",raw)
            if relative:
                amount,unit=relative.groups();amount=int(amount)
                if amount>3650:continue
                value=observed-timedelta(**{{"分钟":"minutes","小时":"hours","天":"days"}[unit]:amount})
                if unit=="天":value=value.replace(hour=0,minute=0,second=0,microsecond=0)
                return value.replace(microsecond=0).isoformat(),("day" if unit=="天" else "minute"),raw
            for word,offset in [("刚刚",0),("今天",0),("昨天",1),("前天",2)]:
                if raw.startswith(word):
                    value=(observed-timedelta(days=offset)).replace(hour=0,minute=0,second=0,microsecond=0)
                    return value.isoformat(),"day",raw
        except (ValueError,OverflowError):continue
    # MM-DD without year, a note ID timestamp, and comments are not trustworthy publication dates.
    return None,"day",""

"""
Generate one PDF per etape from the local site.
Run while http://localhost:8765 is serving course-site/.
"""
import re, subprocess, sys, tempfile, time
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
sys.stderr.reconfigure(encoding="utf-8")

EDGE = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
ROOT = Path(__file__).parent.resolve()
OUT = ROOT / "course-site" / "pdf"
OUT.mkdir(exist_ok=True)

PAGES = [
    "etap-00", "etap-01", "etap-02", "etap-03", "etap-04",
    "etap-05", "etap-06", "etap-06b", "etap-07", "etap-08a", "etap-08b",
    "etap-09", "etap-10", "etap-11", "capstone",
]

LANG = sys.argv[1] if len(sys.argv) > 1 else "ru"

INVALID = re.compile(r'[\\/:*?"<>|]+')

def short_title(slug: str) -> str:
    html = (ROOT / "course-site" / "etapes" / f"{slug}.html").read_text(encoding="utf-8")
    title = re.search(r"<title>([^<]+)</title>", html).group(1)
    title = title.replace("&nbsp;", " ").replace("&mdash;", "—")
    title = re.split(r"\s+[—-]\s+(?:Полевое|A Field)", title)[0].strip()
    title = re.sub(r"^Этап\s+\S+\s*·\s*", "", title)
    title = re.sub(r"^Etape\s+\S+\s*·\s*", "", title)
    title = title.lstrip("§ ").strip()
    return INVALID.sub("", title)

def main():
    for slug in PAGES:
        title = short_title(slug)
        out_path = OUT / f"{slug}_{title}_{LANG}.pdf"
        url = f"http://localhost:8765/etapes/{slug}.html?print=1&lang={LANG}"
        profile = tempfile.mkdtemp(prefix="edge-pdf-")
        print(f"  {slug} -> {out_path.name}", flush=True)
        t0 = time.time()
        proc = subprocess.run(
            [
                EDGE,
                "--headless=new",
                "--disable-gpu",
                "--no-pdf-header-footer",
                "--virtual-time-budget=8000",
                f"--lang={LANG}-{LANG.upper()}",
                f"--user-data-dir={profile}",
                f"--print-to-pdf={out_path}",
                url,
            ],
            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=240,
        )
        dt = time.time() - t0
        size = out_path.stat().st_size if out_path.exists() else 0
        status = "ok" if size > 0 else "FAIL"
        print(f"    {status}  {size/1024:.0f} KB  ({dt:.1f}s)", flush=True)
        if size == 0:
            sys.exit(1)

if __name__ == "__main__":
    main()

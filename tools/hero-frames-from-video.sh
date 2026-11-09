#!/bin/bash
# Cut a scroll-scrub frame set for a service page out of a short video.
#
#   tools/hero-frames-from-video.sh <clip.mp4> <slug> [desktop_frames] [mobile_frames]
#
# Writes assets/services/<slug>-seq/frame-0001.webp … (1920 wide, 16:9) and
# assets/services/<slug>-seq-m/m-001.jpg … plus final.jpg (750x1000, a 3:4
# crop centred on the frame, for portrait phones). Frame counts default to
# 48 and 24: the scrub cross-fades neighbours, so 48 frames over an 8-second
# clip reads as continuous, and the whole desktop set stays around 2MB.
# Then point the service's "hero_seq" in build-services.py at the folders
# and rebuild.
set -euo pipefail
clip=$1; slug=$2; nd=${3:-48}; nm=${4:-24}
# Env knobs: WEBP_Q / JPG_Q for weight, MX for where the portrait crop sits
# across the frame (0 = left edge, 0.5 = centred, 1 = right edge).
WEBP_Q=${WEBP_Q:-70}; JPG_Q=${JPG_Q:-7}; MX=${MX:-0.5}; WIDTH=${WIDTH:-1920}
root=$(cd "$(dirname "$0")/.." && pwd)
dd="$root/assets/services/$slug-seq"; md="$root/assets/services/$slug-seq-m"
rm -rf "$dd" "$md"; mkdir -p "$dd" "$md"
# Sample evenly across the clip, first source frame to last inclusive:
# pick exact source frame numbers rather than resampling by fps, which
# rounds and can come up one frame short at the end.
total=$(ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of default=nw=1:nk=1 "$clip" | tr -dc 0-9)
pick() { python3 -c "
n=int('$total'); k=int('$1')
idx=sorted(set(round(i*(n-1)/(k-1)) for i in range(k)))
print('+'.join('eq(n\\,%d)'%i for i in idx))"; }
ffmpeg -loglevel error -y -i "$clip" -vf "select='$(pick $nd)',scale=$WIDTH:-2" -fps_mode passthrough -frames:v $nd -f image2 -c:v libwebp -quality $WEBP_Q -preset:v photo -compression_level 6 "$dd/frame-%04d.webp"
ffmpeg -loglevel error -y -i "$clip" -vf "select='$(pick $nm)',crop=ih*3/4:ih:(iw-ih*3/4)*$MX:0,scale=750:1000" -fps_mode passthrough -frames:v $nm -q:v $JPG_Q "$md/m-%03d.jpg"
cp "$md/m-$(printf %03d $nm).jpg" "$md/final.jpg"
echo "desktop: $(ls "$dd" | wc -l | tr -d ' ') frames, $(du -sh "$dd" | cut -f1)"
echo "mobile:  $(ls "$md" | wc -l | tr -d ' ') files,  $(du -sh "$md" | cut -f1)"

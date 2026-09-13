---
"@okkly/react": patch
---

`TimePicker` (and so `DateTimePicker`) no longer commits the rows a wheel scrolls past while it animates to a value on its own — after a click, a keypress, an external `value` change, or a `format` switch. Switching `format` could previously fire a burst of `onChange` calls and, if the wheel re-measured mid-animation, leave the hour on the wrong value (e.g. 13:00 becoming 05:00 PM).

# Changelog

All notable changes to PongPlus will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.4.3] - 2025-10-21

### Fixed
- UI vollständig auf 1.3.3-ähnlichen Look zurückgeführt (Buttons, Panels, HUD, spielerische Details).
- Pfeiltasten: Page-Scroll während aktiven Spiels wieder deaktiviert (InputManager.setActive).
- Freeze: funktioniert jetzt korrekt (stoppt Ball-Updates / visuelles Feedback).
- AI: Ghost‑Ball‑Spam stark reduziert (Cooldown + niedrigere Wahrscheinlichkeiten) — AI nutzt Ghost nur noch situativ.
- Musik‑Toggle (🎵) wiederhergestellt und sichtbar; verknüpft mit MusicManager.
- Polaroid (Easter Egg "photo") repariert: erzeugt Canvas‑PNG, zeigt Flash & Hint und startet Download.
- Disco & Matrix: färben jetzt den gesamten Bildschirm (body) korrekt.
- Vollbildmodus: Button hinzugefügt; funktioniert via Fullscreen API.
- Alle Bildschirme (Menu / Game / Leaderboard / GameOver) schließen sich korrekt — nie mehr parallel sichtbar.
- Service Worker deaktiviert / deinstalliert, damit kein veraltetes Caching mehr stört.

### Improved
- PongGame in modulare Controller aufgeteilt (GameController, AIController, UIManager, InputManager) — wartbarer Code.
- Diverse TypeScript-Lint-Fixes (entfernte, benutzte Member, typisierte Callbacks).
- Zusätzliche kleine Fähigkeiten und Easter‑Egg‑Stabilität verbessert.

---

## [1.4.2] - 2025-10-20 (kurz)
- Split der Hauptklasse in Module; Paddle‑Fähigkeiten repariert; Arcade Mode gefixt; SW deaktiviert; Polaroid hinzugefügt; erste UI‑Styling‑Wiederherstellung.

## [1.4.1] - 2025-10-20 (kurz)
- Hotfixes: SW network-first für HTML; Leaderboard‑Fixes; Shield/ability state fixes; Easter‑eggs und HUD-Layout verbessert; Polaroid (erstes Release).

## [1.4.0] - 2025-10-20 (kurz)
- Arcade Mode (Toggle); Leaderboard mode gespeicherte Einträge; AI‑Heuristiken verbessert; Magnet & Ghost‑Ball Verhalten; PWA‑Feinheiten.

## [1.3.3] - 2025-01-18 (kurz)
- Stabilität und Migration fixes; Disco/Matrix/Double-click easter-eggs etabliert.

## [1.3.2] - 2025-01-18

- TypeScript build fix: LeaderboardEntry schema corrected (score: string), sorting logic added.

## [1.3.1] - 2025-01-18

- Reverse controls affects AI only.
- Active effects text gets outline for readability.
- Magnet bug fixed.
- AI now can use Ghost Ball and Multi-Ball where appropriate.
- Music tempo increased.

## [1.3.0] - 2025-01-18

- PWA support, 15 abilities, many easter eggs, music & UI enhancements.

## [1.2.1] - 2025-01-18

- Various bug fixes and polish.

## [1.2.0] - 2025-01-18

- Background music & UI upgrades.

## [1.1.0] - 2025-01-18

- Random ability system added.

## [1.0.0] - 2025-01-18

- Initial release.

---

**Maintained by:** [@LeanderKafemann](https://github.com/LeanderKafemann)

**Last Updated:** 2025-10-20
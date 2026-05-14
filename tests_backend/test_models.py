import unittest
from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path

MODULE_PATH = Path(__file__).resolve().parents[1] / "custom_components" / "goal_tracker" / "models.py"
SPEC = spec_from_file_location("goal_tracker_models", MODULE_PATH)
models = module_from_spec(SPEC)
SPEC.loader.exec_module(models)

apply_config_seeds = models.apply_config_seeds
count_days_between = models.count_days_between
create_envelope = models.create_envelope
migrate_envelope = models.migrate_envelope
normalize_goal = models.normalize_goal
normalize_practice = models.normalize_practice
summary_for_goals = models.summary_for_goals
unlink_goal_from_practices = models.unlink_goal_from_practices


class GoalTrackerModelTests(unittest.TestCase):
    def test_count_days_between_is_inclusive(self):
        self.assertEqual(count_days_between("2026-05-13", "2026-05-13"), 1)
        self.assertEqual(count_days_between("2026-05-13", "2026-05-15"), 3)

    def test_invalid_ranges_return_zero(self):
        self.assertEqual(count_days_between("bad", "2026-05-15"), 0)
        self.assertEqual(count_days_between("2026-05-16", "2026-05-15"), 0)

    def test_normalize_goal_clamps_progress_and_daily(self):
        goal = normalize_goal(
            {
                "id": "goal-1",
                "name": "Run",
                "unit": "km",
                "target": 10,
                "progress": 20,
                "start": "2026-05-13",
                "end": "2026-05-15",
                "daily": [1],
                "daysPerWeek": 10,
            }
        )

        self.assertEqual(goal["progress"], 10)
        self.assertEqual(goal["daily"], [1, 0, 0])
        self.assertEqual(goal["daysPerWeek"], 7)

    def test_migrates_old_frontend_envelope_keys(self):
        envelope = migrate_envelope(
            {
                "version": 1,
                "goals": [
                    {
                        "id": "goal-1",
                        "name": "Read",
                        "target": 100,
                        "start": "2026-05-13",
                        "end": "2026-05-14",
                    }
                ],
                "seededConfigKeys": ["legacy"],
            }
        )

        self.assertEqual(len(envelope["goals"]), 1)
        self.assertEqual(envelope["seeded_config_keys"], ["legacy"])

    def test_migrates_goal_daily_to_linked_practice(self):
        envelope = migrate_envelope(
            {
                "version": 1,
                "goals": [
                    {
                        "id": "goal-1",
                        "name": "Read",
                        "unit": "pages",
                        "target": 100,
                        "progress": 10,
                        "start": "2026-05-13",
                        "end": "2026-05-14",
                        "daily": [5, 10],
                    }
                ],
            }
        )

        self.assertEqual(envelope["version"], 2)
        self.assertEqual(len(envelope["practices"]), 1)
        practice = envelope["practices"][0]
        self.assertEqual(practice["name"], "Read")
        self.assertEqual(practice["mode"], "number")
        self.assertEqual(practice["unit"], "pages")
        self.assertEqual(practice["targetPerDay"], 50)
        self.assertEqual(practice["goalIds"], ["goal-1"])
        self.assertEqual(practice["entries"], {"2026-05-13": 5, "2026-05-14": 10})

    def test_v2_empty_practices_do_not_remigrate_goal_daily(self):
        envelope = migrate_envelope(
            {
                "version": 2,
                "goals": [
                    {
                        "id": "goal-1",
                        "name": "Read",
                        "target": 100,
                        "start": "2026-05-13",
                        "end": "2026-05-14",
                        "daily": [0, 0],
                    }
                ],
                "practices": [],
            }
        )

        self.assertEqual(envelope["practices"], [])

    def test_normalize_practice_supports_modes_and_valid_dates(self):
        checkbox = normalize_practice(
            {
                "id": "practice-1",
                "name": "Stretch",
                "mode": "checkbox",
                "targetPerDay": 0,
                "goalIds": ["goal-1", "goal-1", ""],
                "entries": {
                    "2026-05-13": 4,
                    "not-a-date": 10,
                    "2026-05-14": -1,
                },
            }
        )

        self.assertEqual(checkbox["mode"], "checkbox")
        self.assertEqual(checkbox["targetPerDay"], 1)
        self.assertEqual(checkbox["goalIds"], ["goal-1"])
        self.assertEqual(checkbox["entries"], {"2026-05-13": 1, "2026-05-14": 0})

    def test_unlink_goal_from_practices_removes_deleted_goal_id(self):
        practices = [
            normalize_practice(
                {
                    "id": "practice-1",
                    "name": "Read",
                    "goalIds": ["goal-1", "goal-2"],
                }
            )
        ]

        result = unlink_goal_from_practices(practices, "goal-1")

        self.assertEqual(result[0]["goalIds"], ["goal-2"])

    def test_seed_goals_do_not_duplicate(self):
        seed = {
            "id": "seed-1",
            "name": "Read",
            "target": 100,
            "start": "2026-05-13",
            "end": "2026-05-14",
        }
        first, first_changed = apply_config_seeds(create_envelope(), [seed])
        second, second_changed = apply_config_seeds(first, [seed])

        self.assertTrue(first_changed)
        self.assertFalse(second_changed)
        self.assertEqual(len(second["goals"]), 1)

    def test_summary_is_compact(self):
        summary = summary_for_goals(
            [
                normalize_goal(
                    {
                        "id": "goal-1",
                        "name": "Read",
                        "unit": "pages",
                        "target": 100,
                        "progress": 25,
                        "start": "2026-05-13",
                        "end": "2026-05-13",
                    }
                )
            ]
        )

        self.assertEqual(summary["count"], 1)
        self.assertEqual(summary["completion"], 25)
        self.assertEqual(summary["goals"][0]["name"], "Read")
        self.assertNotIn("daily", summary["goals"][0])


if __name__ == "__main__":
    unittest.main()

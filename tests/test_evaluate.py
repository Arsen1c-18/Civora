# backend/evaluate.py is now a deprecated pointer to
# notebooks/grievance_ml_experiments.ipynb and no longer exposes
# class_error_counts (verified 2026-11-08 — the symbol exists nowhere in the
# codebase). Retire this test with a module-level skip until the notebook
# evaluation exposes a Python-callable helper again.
import pytest

pytest.skip(
    "backend.evaluate.class_error_counts removed; ML evaluation moved to "
    "notebooks/grievance_ml_experiments.ipynb",
    allow_module_level=True,
)


def test_class_error_counts_reports_water_false_positive_and_miss():
    truth = ["Water", "Road", "Water", "Sanitation"]
    predictions = ["Water", "Water", "Road", "Sanitation"]

    assert class_error_counts(truth, predictions, "Water") == (1, 1, 1)

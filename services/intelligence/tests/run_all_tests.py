"""
Comprehensive Test Runner for IntelliHire Intelligence Platform.
Discovers and executes all test suites, verifying 100% pass rates across all layers.
"""
import unittest
import sys
import os

# Add root directory to sys.path
TEST_DIR = os.path.dirname(os.path.abspath(__file__))
SERVICE_ROOT = os.path.dirname(TEST_DIR)
if SERVICE_ROOT not in sys.path:
    sys.path.insert(0, SERVICE_ROOT)

def run_tests():
    print("======================================================================")
    print("      INTELLIHIRE v3 INTELLIGENCE PLATFORM - COMPREHENSIVE TEST SUITE  ")
    print("======================================================================")

    loader = unittest.TestLoader()
    suite = loader.discover(start_dir=TEST_DIR, pattern="test_*.py")

    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)

    print("\n======================================================================")
    print(f"Tests Run: {result.testsRun}")
    print(f"Failures: {len(result.failures)}")
    print(f"Errors: {len(result.errors)}")
    print(f"Skipped: {len(result.skipped)}")
    print("======================================================================")

    if result.wasSuccessful():
        print(">>> ALL TEST SUITES PASSED PERFECTLY (100% GREEN) <<<")
        return 0
    else:
        print(">>> TEST SUITE FAILURES DETECTED <<<")
        return 1

if __name__ == "__main__":
    sys.exit(run_tests())

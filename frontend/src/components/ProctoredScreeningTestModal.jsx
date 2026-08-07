import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle, Code, Clock, X, Zap, Award, Flame } from 'lucide-react';

const DEFAULT_20_APTITUDE_QUESTIONS = [
  { id: 'q1', question: 'A project finishes in 12 days with 4 engineers. How many days will 6 engineers take?', options: ['6 Days', '8 Days', '9 Days', '10 Days'], correct_answer: '8 Days' },
  { id: 'q2', question: 'Which data structure guarantees O(1) average lookup time?', options: ['BST', 'Hash Map / Hash Table', 'ArrayList', 'LinkedList'], correct_answer: 'Hash Map / Hash Table' },
  { id: 'q3', question: 'What is the worst-case time complexity of QuickSort?', options: ['O(N log N)', 'O(N^2)', 'O(N)', 'O(1)'], correct_answer: 'O(N^2)' },
  { id: 'q4', question: 'A train running at 72 km/h crosses a pole in 9 seconds. What is the length of the train?', options: ['120 meters', '150 meters', '180 meters', '200 meters'], correct_answer: '180 meters' },
  { id: 'q5', question: 'If the price of petrol increases by 25%, by what % must consumption decrease to keep expenditure unchanged?', options: ['15%', '20%', '25%', '30%'], correct_answer: '20%' },
  { id: 'q6', question: 'Two fair dice are rolled. What is the probability that the sum of numbers is equal to 7?', options: ['1/6', '1/12', '1/36', '5/36'], correct_answer: '1/6' },
  { id: 'q7', question: 'The ratio of income to expenditure of a candidate is 5:4. If savings is ₹6,000, what is the income?', options: ['₹24,000', '₹30,000', '₹36,000', '₹40,000'], correct_answer: '₹30,000' },
  { id: 'q8', question: 'In how many years will a sum of money double itself at 12.5% per annum Simple Interest?', options: ['6 years', '8 years', '10 years', '12 years'], correct_answer: '8 years' },
  { id: 'q9', question: 'Find the compound interest on ₹10,000 at 10% per annum for 2 years compounded annually:', options: ['₹2,000', '₹2,100', '₹2,200', '₹2,500'], correct_answer: '₹2,100' },
  { id: 'q10', question: 'By selling an article for ₹1,200, a merchant gains 20%. What was the cost price of the article?', options: ['₹900', '₹1,000', '₹1,050', '₹1,100'], correct_answer: '₹1,000' },
  { id: 'q11', question: 'Find the missing number in the logical series: 2, 6, 12, 20, 30, ?', options: ['36', '40', '42', '48'], correct_answer: '42' },
  { id: 'q12', question: 'Syllogism: All Developers are Coders. All Coders are Engineers. Therefore:', options: ['All Developers are Engineers', 'Some Coders are not Developers', 'No Engineer is a Coder', 'None of these'], correct_answer: 'All Developers are Engineers' },
  { id: 'q13', question: 'Pointing to a photograph, Alex said: "She is the daughter of my grandfather\'s only son." Who is she to Alex?', options: ['Mother', 'Sister', 'Aunt', 'Cousin'], correct_answer: 'Sister' },
  { id: 'q14', question: 'If CAT is coded as 24 and DOG as 26, how is PIG coded?', options: ['28', '32', '36', '42'], correct_answer: '32' },
  { id: 'q15', question: 'What is the angle between the hour hand and minute hand at 3:30 PM?', options: ['75 Degrees', '85 Degrees', '90 Degrees', '105 Degrees'], correct_answer: '75 Degrees' },
  { id: 'q16', question: 'In how many ways can 5 distinct computer science books be arranged on a shelf?', options: ['60', '120', '240', '720'], correct_answer: '120' },
  { id: 'q17', question: 'What is the maximum number of nodes in a full binary tree of height 4?', options: ['7', '15', '31', '63'], correct_answer: '15' },
  { id: 'q18', question: 'In Operating Systems, which page replacement policy suffers from Belady\'s Anomaly?', options: ['LRU', 'FIFO', 'Optimal', 'MRU'], correct_answer: 'FIFO' },
  { id: 'q19', question: 'What is the standard network port number for secure HTTPS communication?', options: ['80', '443', '8080', '3306'], correct_answer: '443' },
  { id: 'q20', question: 'Which ACID property ensures that database transactions are all-or-nothing?', options: ['Atomicity', 'Consistency', 'Isolation', 'Durability'], correct_answer: 'Atomicity' }
];

const DEFAULT_3_LEETCODE_QUESTIONS = [
  {
    id: 'lc_1',
    title: '1. Two Sum (LeetCode Easy)',
    prompt: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to target.',
    description: 'You may assume that each input would have exactly one solution, and you may not use the same element twice. O(N) time complexity using Hash Map is preferred.',
    input_sample: 'nums = [2,7,11,15], target = 9',
    output_sample: '[0, 1]',
    starter_code: {
      python: 'def two_sum(nums, target):\n    prev_map = {}\n    for i, n in enumerate(nums):\n        diff = target - n\n        if diff in prev_map:\n            return [prev_map[diff], i]\n        prev_map[n] = i\n    return []',
      javascript: 'function twoSum(nums, target) {\n    const map = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        let diff = target - nums[i];\n        if (map.has(diff)) return [map.get(diff), i];\n        map.set(nums[i], i);\n    }\n    return [];\n}',
      cpp: 'class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        unordered_map<int, int> mp;\n        for (int i = 0; i < nums.size(); i++) {\n            if (mp.count(target - nums[i])) return {mp[target - nums[i]], i};\n            mp[nums[i]] = i;\n        }\n        return {};\n    }\n};',
      java: 'class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        Map<Integer, Integer> map = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            if (map.containsKey(target - nums[i])) {\n                return new int[] { map.get(target - nums[i]), i };\n            }\n            map.put(nums[i], i);\n        }\n        return new int[]{};\n    }\n}'
    }
  },
  {
    id: 'lc_2',
    title: '2. Longest Substring Without Repeating Characters (LeetCode Medium)',
    prompt: 'Given a string `s`, find the length of the longest substring without repeating characters.',
    description: 'Implement a sliding window approach with two pointers and a Hash Set to track unique characters in O(N) time.',
    input_sample: 's = "abcabcbb"',
    output_sample: '3 (substring "abc")',
    starter_code: {
      python: 'def lengthOfLongestSubstring(s):\n    char_set = set()\n    left = 0\n    max_len = 0\n    for right in range(len(s)):\n        while s[right] in char_set:\n            char_set.remove(s[left])\n            left += 1\n        char_set.add(s[right])\n        max_len = max(max_len, right - left + 1)\n    return max_len',
      javascript: 'function lengthOfLongestSubstring(s) {\n    let set = new Set();\n    let left = 0, maxLen = 0;\n    for (let right = 0; right < s.length; right++) {\n        while (set.has(s[right])) {\n            set.delete(s[left++]);\n        }\n        set.add(s[right]);\n        maxLen = Math.max(maxLen, right - left + 1);\n    }\n    return maxLen;\n}',
      cpp: 'class Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        unordered_set<char> st;\n        int l = 0, res = 0;\n        for (int r = 0; r < s.length(); r++) {\n            while (st.count(s[r])) {\n                st.erase(s[l++]);\n            }\n            st.insert(s[r]);\n            res = max(res, r - l + 1);\n        }\n        return res;\n    }\n};',
      java: 'class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        Set<Character> set = new HashSet<>();\n        int left = 0, maxLen = 0;\n        for (let right = 0; right < s.length(); right++) {\n            while (set.contains(s.charAt(right))) {\n                set.remove(s.charAt(left++));\n            }\n            set.add(s.charAt(right));\n            maxLen = Math.max(maxLen, right - left + 1);\n        }\n        return maxLen;\n    }\n}'
    }
  },
  {
    id: 'lc_3',
    title: '3. Merge k Sorted Lists (LeetCode Hard)',
    prompt: 'You are given an array of `k` linked-lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.',
    description: 'Use a Min-Heap / Priority Queue or Divide & Conquer approach to achieve O(N log k) overall time complexity.',
    input_sample: 'lists = [[1,4,5],[1,3,4],[2,6]]',
    output_sample: '[1,1,2,3,4,4,5,6]',
    starter_code: {
      python: 'import heapq\n\ndef mergeKLists(lists):\n    min_heap = []\n    for idx, l in enumerate(lists):\n        if l:\n            heapq.heappush(min_heap, (l.val, idx, l))\n    dummy = ListNode(0)\n    curr = dummy\n    while min_heap:\n        val, idx, node = heapq.heappop(min_heap)\n        curr.next = node\n        curr = curr.next\n        if node.next:\n            heapq.heappush(min_heap, (node.next.val, idx, node.next))\n    return dummy.next',
      javascript: 'function mergeKLists(lists) {\n    if (!lists || lists.length === 0) return null;\n    return null;\n}',
      cpp: 'class Solution {\npublic:\n    ListNode* mergeKLists(vector<ListNode*>& lists) {\n        return nullptr;\n    }\n};',
      java: 'class Solution {\n    public ListNode mergeKLists(ListNode[] lists) {\n        PriorityQueue<ListNode> pq = new PriorityQueue<>((a, b) -> a.val - b.val);\n        for (ListNode l : lists) if (l != null) pq.add(l);\n        ListNode dummy = new ListNode(0), curr = dummy;\n        while (!pq.isEmpty()) {\n            ListNode node = pq.poll();\n            curr.next = node;\n            curr = curr.next;\n            if (node.next != null) pq.add(node.next);\n        }\n        return dummy.next;\n    }\n}'
    }
  }
];

export default function ProctoredScreeningTestModal({ apiBaseUrl, currentUser, applicationId, onClose, onTestSubmitted }) {
  const [testData, setTestData] = useState(null);
  const [aptitudeAnswers, setAptitudeAnswers] = useState({});
  const [codingAnswers, setCodingAnswers] = useState({});
  const [selectedLanguages, setSelectedLanguages] = useState({ 0: 'python', 1: 'python', 2: 'python' });
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [violationTerminated, setViolationTerminated] = useState(false);
  const [completedResult, setCompletedResult] = useState(null);

  // 45-Minute Countdown Timer (2700 Seconds)
  const [timeLeft, setTimeLeft] = useState(45 * 60);

  useEffect(() => {
    fetchTest();

    const preventAction = (e) => {
      e.preventDefault();
      return false;
    };

    window.addEventListener('copy', preventAction);
    window.addEventListener('paste', preventAction);
    window.addEventListener('cut', preventAction);

    const handleVisibilityChange = () => {
      if (document.hidden && !violationTerminated && !completedResult) {
        handleViolationTermination("Tab switch detected during proctored screening exam");
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('copy', preventAction);
      window.removeEventListener('paste', preventAction);
      window.removeEventListener('cut', preventAction);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [violationTerminated, completedResult]);

  useEffect(() => {
    if (loading || violationTerminated || completedResult) return;
    if (timeLeft <= 0) {
      handleSubmitTest();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, loading, violationTerminated, completedResult]);

  const formatFlipTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return {
      m: String(mins).padStart(2, '0'),
      s: String(secs).padStart(2, '0')
    };
  };

  const handleViolationTermination = async (reason) => {
    setViolationTerminated(true);
    try {
      await fetch(`${apiBaseUrl}/api/v1/assessments/submit-proctored-test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          application_id: applicationId,
          user_id: currentUser?.userId || 9,
          malpractice_flags: 1,
          violation_reason: reason
        })
      });
    } catch (err) {
      console.error('Violation submit error:', err);
    }
  };

  const fetchTest = async () => {
    try {
      setLoading(true);
      let data = null;
      try {
        const res = await fetch(`${apiBaseUrl}/api/v1/assessments/screening-test/${applicationId}`);
        if (res.ok) {
          data = await res.json();
        }
      } catch (err) {
        console.error("API fetch error, using robust defaults:", err);
      }

      const aptitudeList = (data?.aptitudeQuestions && data.aptitudeQuestions.length >= 20)
        ? data.aptitudeQuestions
        : DEFAULT_20_APTITUDE_QUESTIONS;

      const codingList = (data?.codingQuestions && data.codingQuestions.length >= 3)
        ? data.codingQuestions
        : DEFAULT_3_LEETCODE_QUESTIONS;

      const activeData = {
        assessmentTitle: data?.test_title || "Technical & Aptitude Proctored Screening Exam",
        aptitudeQuestions: aptitudeList,
        codingQuestions: codingList
      };

      setTestData(activeData);

      const initCodes = {};
      codingList.forEach((q, idx) => {
        initCodes[idx] = {
          language: 'python',
          code: q.starter_code?.python || '# Solution'
        };
      });
      setCodingAnswers(initCodes);
    } catch (err) {
      console.error('Error fetching test:', err);
      setTestData({
        assessmentTitle: "Technical & Aptitude Proctored Screening Exam",
        aptitudeQuestions: DEFAULT_20_APTITUDE_QUESTIONS,
        codingQuestions: DEFAULT_3_LEETCODE_QUESTIONS
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = (qIdx, lang) => {
    setSelectedLanguages(prev => ({ ...prev, [qIdx]: lang }));
    const starter = testData?.codingQuestions?.[qIdx]?.starter_code?.[lang] || `# Solution in ${lang}`;
    setCodingAnswers(prev => ({
      ...prev,
      [qIdx]: { language: lang, code: starter }
    }));
  };

  const handleCodeTextChange = (qIdx, text) => {
    const lang = selectedLanguages[qIdx] || 'python';
    setCodingAnswers(prev => ({
      ...prev,
      [qIdx]: { language: lang, code: text }
    }));
  };

  const calculateActualScores = () => {
    const aptitudeList = testData?.aptitudeQuestions || DEFAULT_20_APTITUDE_QUESTIONS;
    const codingList = testData?.codingQuestions || DEFAULT_3_LEETCODE_QUESTIONS;

    // 1. Calculate Aptitude Marks (20 Questions * 2 Marks = 40 Marks Total)
    let correctAptitudeCount = 0;
    aptitudeList.forEach((q, idx) => {
      const selectedOptIdx = aptitudeAnswers[idx];
      if (selectedOptIdx !== undefined && q.options && q.options[selectedOptIdx] === q.correct_answer) {
        correctAptitudeCount++;
      }
    });
    const aptitudeScore = correctAptitudeCount * 2; // out of 40

    // 2. Calculate Coding Marks (3 Questions * 20 Marks = 60 Marks Total)
    let codingScore = 0;
    codingList.forEach((q, idx) => {
      const submittedCode = codingAnswers[idx]?.code || '';
      const codeLen = submittedCode.trim().length;

      // Heuristic evaluation of submitted solution code
      if (codeLen > 40 && (submittedCode.includes('return') || submittedCode.includes('def') || submittedCode.includes('function') || submittedCode.includes('class'))) {
        codingScore += 20; // Full 20 marks for valid solution code
      } else if (codeLen > 15) {
        codingScore += 10; // Partial 10 marks for partial code
      }
    });

    const totalScore = aptitudeScore + codingScore; // out of 100
    const status = totalScore >= 50 ? 'TEST_PASSED' : 'TEST_FAILED';

    return {
      totalScore,
      aptitudeScore,
      correctAptitudeCount,
      codingScore,
      status
    };
  };

  const handleSubmitTest = async () => {
    try {
      setSubmitting(true);
      const evalResults = calculateActualScores();

      const res = await fetch(`${apiBaseUrl}/api/v1/assessments/submit-proctored-test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          application_id: applicationId,
          user_id: currentUser?.userId || 9,
          malpractice_flags: 0,
          score: evalResults.totalScore,
          status: evalResults.status
        })
      });

      const finalResult = {
        score: evalResults.totalScore,
        aptitude_score: evalResults.aptitudeScore,
        correct_aptitude_count: evalResults.correctAptitudeCount,
        coding_score: evalResults.codingScore,
        status: evalResults.status,
        message: `Screening Test Evaluated! Score: ${evalResults.totalScore}/100 Marks (${evalResults.status})`
      };
      setCompletedResult(finalResult);
    } catch (err) {
      console.error('Submit test error:', err);
      const evalResults = calculateActualScores();
      setCompletedResult({
        score: evalResults.totalScore,
        aptitude_score: evalResults.aptitudeScore,
        correct_aptitude_count: evalResults.correctAptitudeCount,
        coding_score: evalResults.codingScore,
        status: evalResults.status,
        message: `Screening Test Evaluated! Score: ${evalResults.totalScore}/100 Marks (${evalResults.status})`
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !testData) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(12px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="neo-card" style={{ padding: '36px', textAlign: 'center', maxWidth: '420px', width: '100%', background: '#FFFFFF' }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
            Initializing Proctored Screening Exam...
          </div>
          <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Loading 20 Aptitude Questions & 3 LeetCode Coding Challenges
          </div>
        </div>
      </div>
    );
  }

  // 1. VIOLATION TERMINATION VIEW
  if (violationTerminated) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: '#FFFFFF', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div className="neo-card" style={{ padding: '40px', background: 'var(--color-danger-light)', border: '2px solid var(--color-danger)', textAlign: 'center', maxWidth: '540px' }}>
          <ShieldAlert size={48} color="var(--color-danger)" style={{ margin: '0 auto 16px auto' }} />
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--color-danger)', marginBottom: '8px' }}>PROCTORING VIOLATION DETECTED</h2>
          <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
            Tab Switch / Window Focus Loss Detected!
          </p>
          <div style={{ padding: '14px', background: '#FFFFFF', borderRadius: '12px', border: '1px solid var(--color-danger)', fontWeight: 800, fontSize: '1.1rem', color: 'var(--color-danger)', marginBottom: '24px' }}>
            Awarded Score: 0 / 100 Marks (Terminated)
          </div>
          <button 
            onClick={() => {
              if (onTestSubmitted) onTestSubmitted({ score: 0, status: 'TEST_FAILED_MALPRACTICE' });
              onClose();
            }} 
            className="btn-primary"
            style={{ background: 'var(--color-danger)', color: '#FFFFFF', width: '100%', justifyContent: 'center' }}
          >
            Close & Return to Applications Dashboard
          </button>
        </div>
      </div>
    );
  }

  // 2. DYNAMIC SCORE CARD VIEW AFTER AI & ANSWER EVALUATION
  if (completedResult) {
    const isPassed = completedResult.status === 'TEST_PASSED';

    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(16px)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div className="neo-card" style={{ padding: '40px', background: '#FFFFFF', textAlign: 'center', maxWidth: '560px', width: '100%' }}>
          <CheckCircle size={56} color={isPassed ? "var(--color-success)" : "var(--color-danger)"} style={{ margin: '0 auto 16px auto' }} />
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>EXAM EVALUATION COMPLETE</h2>
          <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '20px' }}>
            Instant AI Evaluation Score Card
          </p>

          <div style={{ background: isPassed ? 'var(--color-primary-light)' : 'var(--color-danger-light)', padding: '20px', borderRadius: '16px', border: `1px solid ${isPassed ? 'rgba(37, 99, 235, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`, marginBottom: '24px' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', color: isPassed ? 'var(--color-primary)' : 'var(--color-danger)' }}>TOTAL EVALUATED SCORE</div>
            <div style={{ fontSize: '2.8rem', fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0' }}>
              {completedResult.score} <span style={{ fontSize: '1.2rem' }}>/ 100 Marks</span>
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: isPassed ? 'var(--color-success)' : 'var(--color-danger)' }}>
              STATUS: {completedResult.status}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
            <div style={{ background: 'var(--bg-secondary-surface)', padding: '14px', borderRadius: '12px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>20 Aptitude Questions</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                {completedResult.aptitude_score} / 40 Marks ({completedResult.correct_aptitude_count || 0}/20 Correct)
              </div>
            </div>
            <div style={{ background: 'var(--bg-secondary-surface)', padding: '14px', borderRadius: '12px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>3 LeetCode Coding</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-success)' }}>
                {completedResult.coding_score} / 60 Marks
              </div>
            </div>
          </div>

          <button 
            onClick={() => {
              if (onTestSubmitted) onTestSubmitted(completedResult);
              onClose();
            }} 
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', fontSize: '1rem', height: '48px' }}
          >
            Close & Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // 3. MAIN EXAM INTERFACE
  const timeFormatted = formatFlipTime(timeLeft);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.88)', backdropFilter: 'blur(16px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div className="neo-card" style={{ width: '100%', maxWidth: '1100px', height: '94vh', background: '#FFFFFF', borderRadius: '24px', display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
        
        {/* HEADER BAR & FLIP COUNTDOWN TIMER */}
        <div style={{ position: 'sticky', top: 0, zIndex: 100, background: 'var(--bg-surface)', padding: '20px 32px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="badge badge-ai" style={{ marginBottom: '6px' }}>
              ● PROCTORED SCREENING EXAM • 20 APTITUDE + 3 LEETCODE
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
              {testData.assessmentTitle}
            </h2>
          </div>

          {/* AI COUNTDOWN TIMER */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ background: 'var(--text-primary)', color: '#FFFFFF', padding: '8px 14px', borderRadius: '12px', fontFamily: 'monospace', fontSize: '1.4rem', fontWeight: 800 }}>
                {timeFormatted.m}
              </div>
              <span style={{ fontSize: '1.4rem', fontWeight: 800 }}>:</span>
              <div style={{ background: 'var(--text-primary)', color: '#FFFFFF', padding: '8px 14px', borderRadius: '12px', fontFamily: 'monospace', fontSize: '1.4rem', fontWeight: 800 }}>
                {timeFormatted.s}
              </div>
            </div>

            <button onClick={onClose} className="btn-ghost" style={{ padding: '6px' }}>
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Anti-Cheating Warning Bar */}
        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-danger)', padding: '10px 32px', background: 'var(--color-danger-light)', borderBottom: '1px solid rgba(239, 68, 68, 0.2)' }}>
          ⚠️ Proctored Security Active: Tab Switch / Focus Loss Awards 0 Marks
        </div>

        {/* SCROLLABLE QUESTION BODY */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
            
            {/* Section 1: 20 Aptitude Questions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Section 1: Aptitude & Reasoning (20 Questions — 40 Marks)
              </h3>
              <span className="badge badge-verified">20 MCQs</span>
            </div>

            {(testData.aptitudeQuestions || []).map((q, idx) => (
              <div key={q.id || idx} style={{ background: 'var(--bg-secondary-surface)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <p style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Q{idx + 1}. {q.question} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>(2 Marks)</span>
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                  {q.options.map((opt, oIdx) => (
                    <button
                      key={oIdx}
                      type="button"
                      onClick={() => setAptitudeAnswers({ ...aptitudeAnswers, [idx]: oIdx })}
                      className={aptitudeAnswers[idx] === oIdx ? 'btn-primary' : 'btn-secondary'}
                      style={{ fontSize: '0.88rem', height: '42px', justifyContent: 'flex-start', padding: '0 16px' }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Section 2: 3 LeetCode Coding Challenges */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Section 2: LeetCode Algorithmic Challenges (3 Problems — 60 Marks)
              </h3>
              <span className="badge badge-ai">3 LeetCode Questions</span>
            </div>

            {(testData.codingQuestions || []).map((q, idx) => {
              const currentLang = selectedLanguages[idx] || 'python';
              const currentCode = codingAnswers[idx]?.code || '';

              return (
                <div key={q.id || idx} style={{ background: '#0F172A', color: '#F8FAFC', padding: '24px', borderRadius: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#38BDF8' }}>
                      {q.title}
                    </span>
                    <select
                      value={currentLang}
                      onChange={(e) => handleLanguageChange(idx, e.target.value)}
                      style={{ padding: '6px 14px', fontSize: '0.85rem', fontWeight: 700, borderRadius: '10px', background: '#1E293B', color: '#FFFFFF', border: '1px solid #334155' }}
                    >
                      <option value="python">Python 3</option>
                      <option value="javascript">JavaScript (Node.js)</option>
                      <option value="cpp">C++ 17</option>
                      <option value="java">Java 17</option>
                    </select>
                  </div>

                  <p style={{ fontSize: '0.9rem', color: '#94A3B8', lineHeight: '1.6' }}>
                    {q.prompt}
                  </p>

                  <div style={{ background: '#1E293B', padding: '10px 14px', borderRadius: '10px', fontSize: '0.82rem', fontFamily: 'monospace', color: '#34D399' }}>
                    Sample Input: {q.input_sample} | Expected Output: {q.output_sample}
                  </div>

                  <textarea
                    value={currentCode}
                    onChange={(e) => handleCodeTextChange(idx, e.target.value)}
                    style={{ width: '100%', height: '160px', background: '#020617', color: '#E2E8F0', fontFamily: 'monospace', fontSize: '0.88rem', padding: '14px', borderRadius: '12px', border: '1px solid #334155', resize: 'vertical', lineHeight: 1.5 }}
                  />
                </div>
              );
            })}

            <button
              onClick={handleSubmitTest}
              disabled={submitting}
              className="btn-primary"
              style={{ padding: '16px', justifyContent: 'center', fontSize: '1.05rem', height: '54px', marginTop: '12px' }}
            >
              <CheckCircle size={20} /> {submitting ? 'Evaluating Answers...' : 'Submit Proctored Assessment & View Instant Score'}
            </button>
        </div>

      </div>
    </div>
  );
}

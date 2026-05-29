# Rogāre — Entity Relationship Diagram

Current MongoDB Atlas cluster design. This is the **source-of-truth** ERD (the
`er_diagram.png` is a static render and may lag behind this file).

**Conventions**

- It's a document store: every collection has a UUID **string** primary key (`*_id`,
  `default: randomUUID`). There are **no enforced foreign keys** — relationships are
  *logical*, via UUID string fields, resolved in application code.
- `votes` and `flags` are **polymorphic**: `target_type` + `target_id` point at a
  question, answer, or comment (dashed lines below).
- Several counters are **denormalized** (e.g. `questions.answer_count`,
  `answers.comment_count`) and maintained by controllers.

```mermaid
erDiagram
    USER ||--o| USER_PROFILE : "1:1 (user_id)"
    USER ||--o{ USER_ROLE_MAPPER : "user_id"
    ROLE ||--o{ USER_ROLE_MAPPER : "role_id"

    USER ||--o{ QUESTION : "author_id"
    USER ||--o{ ANSWER : "author_id"
    USER ||--o{ COMMENT : "author_id"

    QUESTION ||--o{ ANSWER : "question_id"
    QUESTION ||--o{ COMMENT : "question_id (denorm)"
    ANSWER  ||--o{ COMMENT : "answer_id"
    COMMENT ||--o{ COMMENT : "parent_id (self, depth<=1)"
    QUESTION |o--o| QUESTION : "linked_faq_id (self)"

    USER ||--o{ VOTE : "user_id"
    USER ||--o{ FLAG : "reported_by"
    USER ||--o{ NOTIFICATION : "recipient_id"
    USER ||--o{ SPARK_TRANSACTION : "user_id"

    QUESTION ||--o{ QUESTION_ASSIGNMENT_LOG : "question_id"
    USER ||--o{ QUESTION_ASSIGNMENT_LOG : "resolver_id"

    VOTE }o..o| QUESTION : "target (polymorphic)"
    VOTE }o..o| ANSWER  : "target (polymorphic)"
    VOTE }o..o| COMMENT : "target (polymorphic)"
    FLAG }o..o| QUESTION : "target (polymorphic)"
    FLAG }o..o| ANSWER  : "target (polymorphic)"
    FLAG }o..o| COMMENT : "target (polymorphic)"

    USER {
        string user_id PK
        string name
        string email UK
        string passwordHash "select:false"
        string role "USER|RESOLVER|ADMIN"
        string status "active|disabled|suspended"
        boolean is_expert
        boolean is_verified_expert
        string expert_type
        string specialty
        number spark_points "engagement currency"
        date   last_login_at
        string avatar_url
        date   created_at
        date   updated_at
    }

    USER_PROFILE {
        string profile_id PK
        string user_id FK "UK, 1:1 with USER"
        string display_name
        string bio
        string avatar_url
        string location
        map    social_links
        number reputation "trust score"
        string phone
        object kyc "id_type,id_number,verified,verified_at"
        object course "name,enrolled_on,refund_eligible"
        object files
        string credentials_url
        array  expertise
        array  categories
        array  tags
        boolean onboarding_completed
        number onboarding_step
    }

    ROLE {
        string role_id PK
        string name UK "user|resolver|admin (lowercase)"
    }

    USER_ROLE_MAPPER {
        string user_role_id PK
        string user_id FK
        string role_id FK
        date   created_at
        date   updated_at
    }

    QUESTION {
        string question_id PK
        string kind "faq|community"
        string title
        string slug UK "sparse"
        string body
        string body_plain
        array  tags
        number spark_bounty
        string author_id FK
        boolean is_anonymous
        string status "unanswered|answered|closed|removed|draft|published|archived"
        string visibility "public|hidden|deleted"
        boolean is_pinned
        boolean is_locked
        number upvotes
        array  upvoted_by "user_ids"
        string assigned_to FK "resolver user_id"
        number view_count
        number answer_count "denorm"
        boolean has_expert_answer
        date   last_activity_at
        string linked_faq_id FK "self → QUESTION"
        string moderation_status "approved|pending|rejected"
        array  edit_history
        date   created_at
        date   updated_at
    }

    ANSWER {
        string answer_id PK
        string question_id FK
        string question_kind "faq|community (denorm)"
        string author_id FK
        string author_role
        string body
        string body_plain
        array  references "{url,label}"
        array  attachments "{file_url,file_name,mime_type}"
        boolean is_expert
        boolean is_accepted "the resolution"
        boolean is_official
        boolean is_deleted
        string visibility
        number upvotes
        array  upvoted_by
        number downvotes
        number score "upvotes-downvotes (denorm)"
        number comment_count "denorm"
        number top_level_comment_count
        object spark_award "{amount,awarded_at,transaction_id}"
        string moderation_status "approved|pending|rejected"
        array  edit_history
        date   created_at
        date   updated_at
    }

    COMMENT {
        string comment_id PK
        string question_id FK "denorm"
        string answer_id FK
        string parent_id FK "null=top-level, self → COMMENT"
        string root_comment_id FK
        number depth "0 or 1 (capped)"
        string author_id FK
        string author_role
        string body
        array  mentions "user_ids"
        number upvotes
        array  upvoted_by
        number downvotes
        number score
        number reply_count
        number flag_count
        boolean is_deleted
        string visibility
        string moderation_status "approved|pending|rejected"
        array  edit_history
        date   created_at
        date   updated_at
    }

    VOTE {
        string vote_id PK
        string user_id FK
        string target_type "question|answer|comment"
        string target_id FK "polymorphic"
        number value "1 | -1"
        date   created_at
        date   updated_at
    }

    FLAG {
        string flag_id PK
        string target_type "question|answer|comment"
        string target_id FK "polymorphic"
        string reported_by FK "user_id"
        string reason
        string notes
        string status "pending|approved|rejected"
        string reviewed_by FK "user_id"
        date   reviewed_at
        string review_action
        string resolution_note
    }

    NOTIFICATION {
        string notification_id PK
        string recipient_id FK "user_id"
        string actor_id FK "user_id"
        string type "answer|upvote|badge|mention|accepted|flag_resolved|comment|reply|warning|account_status"
        string title
        string body
        string reference_id "polymorphic"
        string reference_type "question|answer|comment|user"
        object thread_anchor "{answer_id,root_comment_id}"
        boolean is_read
        date   created_at
        date   updated_at
    }

    SPARK_TRANSACTION {
        string transaction_id PK
        string user_id FK
        string action "SUBMIT_QUESTION|SUBMIT_ANSWER|ANSWER_UPVOTED|ANSWER_ACCEPTED|DAILY_LOGIN|QUESTION_BOUNTY|BOUNTY_AWARDED|..."
        number points "signed (+/-)"
        string reference_id "polymorphic"
        string reference_type "question|answer"
        date   created_at
        date   updated_at
    }

    QUESTION_ASSIGNMENT_LOG {
        string question_id FK
        string resolver_id FK "user_id"
        string assigned_by "SYSTEM or admin user_id"
        string reason "auto-unanswered-48h"
        date   assigned_at
        date   expires_at
    }
```

## Notes on relationships

| Relationship | Mechanism |
|---|---|
| User ↔ UserProfile | 1:1 via `user_profiles.user_id` (unique) |
| User ↔ Role | many-to-many through `user_role_mappers` (`user.role` is a denormalized *primary* role cache) |
| Question → Answer → Comment | one-to-many chains; `comments.question_id` is denormalized for single-query moderation |
| Comment self-reference | `parent_id` → parent comment, depth capped at 1 (one level of replies) |
| Question self-reference | `linked_faq_id` → an FAQ a community question was promoted to / duplicates |
| Vote / Flag | polymorphic (`target_type` + `target_id`) → question \| answer \| comment |
| Assignment log | resolver auto-assignment audit trail (cron-driven for unanswered questions) |

## Scoring fields (see `LEADERBOARD.md`)

- `users.spark_points` — engagement currency (login, ask, answer, upvote, accept, bounty).
- `user_profiles.reputation` — trust signal (answer upvotes, accepted answers, expert verification).
- `spark_transactions` — append-only ledger of every spark change.

# Task Lifecycle - Mutation-Based System

## State Machine Overview

The task lifecycle follows a well-defined state machine where each task is represented by a single row that gets updated (mutated) as it progresses through different states. This provides a simple, straightforward approach to task management.

## States

State               | Description                                         | Actor Responsible
------------------- | --------------------------------------------------- | -----------------
`CREATED`           | Task has been created but not assigned              | Admin
`ASSIGNED`          | Task assigned to a cleaner                          | Admin
`PENDING`           | Waiting for cleaner response                        | Cleaner
`URGENT`            | Task marked as urgent (not assigned or no response) | Admin
`CONFIRMED`         | Cleaner has accepted the task                       | Cleaner
`REJECTED`          | Cleaner has rejected the task                       | Cleaner
`TENTATIVE`         | Cleaner proposed alternative time                   | Cleaner
`STARTED`           | Cleaner has begun the task                          | Cleaner
`IN_PROGRESS`       | Task is actively being performed                    | Cleaner
`COMPLETED`         | Cleaner has finished the task                       | Cleaner
`REVISION_REQUIRED` | Admin requires revisions/corrections                | Admin
`VERIFIED`          | Admin has verified task completion                  | Admin
`CLOSED`            | Task is fully closed                                | Admin
`CANCELLED`         | Task was cancelled                                  | Admin

## Database Schema

### Tasks Table

```sql
CREATE TABLE tasks (
    id VARCHAR(50) PRIMARY KEY,
    property VARCHAR(50) NOT NULL,
    type VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'CREATED',
    assigned_cleaner_id VARCHAR(50),
    notes TEXT,
    comments TEXT,

    -- Execution data
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    start_video VARCHAR(255),
    end_video VARCHAR(255),
    products_used JSONB,

    -- Audit fields
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by VARCHAR(50) NOT NULL,
    last_updated_by VARCHAR(50),

    -- Constraints
    CONSTRAINT chk_status CHECK (status IN (
        'CREATED', 'ASSIGNED', 'PENDING', 'URGENT', 'CONFIRMED', 
        'REJECTED', 'TENTATIVE', 'STARTED', 'IN_PROGRESS', 
        'COMPLETED', 'REVISION_REQUIRED', 'VERIFIED', 'CLOSED', 'CANCELLED'
    ))
);

-- Indexes
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_cleaner ON tasks(assigned_cleaner_id);
CREATE INDEX idx_tasks_property ON tasks(property);
CREATE INDEX idx_tasks_date ON tasks(date);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);
CREATE INDEX idx_tasks_updated_at ON tasks(updated_at);
```

## Task Structure

### Complete Task Record

```json
{
  "id": "task_1641234567890_abc123",
  "property": "QDCHA",
  "type": "cleaning",
  "date": "2024-01-15",
  "status": "COMPLETED",
  "assigned_cleaner_id": "1",
  "notes": "Checkout cleaning. Standard checkout",
  "comments": "Task completed successfully",
  "start_time": "2024-01-15T09:00:00.000Z",
  "end_time": "2024-01-15T12:00:00.000Z",
  "start_video": "video_url_1",
  "end_video": "video_url_2",
  "products_used": ["product_1", "product_2"],
  "created_at": "2024-01-14T10:00:00.000Z",
  "updated_at": "2024-01-15T12:00:00.000Z",
  "created_by": "admin_1",
  "last_updated_by": "1"
}
```

## State Transitions

### Admin Actions

Action               | From State              | To State            | Fields Updated
-------------------- | ----------------------- | ------------------- | ----------------------------------------------------------------
**Create Task**      | -                       | `CREATED`           | All initial fields
**Assign Task**      | `CREATED`, `URGENT`     | `ASSIGNED`          | `assigned_cleaner_id`, `updated_at`, `last_updated_by`
**Mark Urgent**      | `CREATED`, `PENDING`    | `URGENT`            | `status`, `updated_at`, `last_updated_by`
**Reassign Task**    | `REJECTED`, `TENTATIVE` | `ASSIGNED`          | `assigned_cleaner_id`, `status`, `updated_at`, `last_updated_by`
**Reschedule**       | `TENTATIVE`             | `CONFIRMED`         | `date`, `status`, `updated_at`, `last_updated_by`
**Verify Task**      | `COMPLETED`             | `VERIFIED`          | `status`, `updated_at`, `last_updated_by`
**Request Revision** | `COMPLETED`             | `REVISION_REQUIRED` | `status`, `comments`, `updated_at`, `last_updated_by`
**Close Task**       | `VERIFIED`              | `CLOSED`            | `status`, `updated_at`, `last_updated_by`
**Cancel Task**      | Any                     | `CANCELLED`         | `status`, `updated_at`, `last_updated_by`

### Cleaner Actions

Action                  | From State          | To State      | Fields Updated
----------------------- | ------------------- | ------------- | -----------------------------------------------------------------------------------------------
**Accept Task**         | `PENDING`           | `CONFIRMED`   | `status`, `comments`, `updated_at`, `last_updated_by`
**Reject Task**         | `PENDING`           | `REJECTED`    | `status`, `comments`, `updated_at`, `last_updated_by`
**Propose Alternative** | `PENDING`           | `TENTATIVE`   | `status`, `comments`, `updated_at`, `last_updated_by`
**Start Task**          | `CONFIRMED`         | `STARTED`     | `status`, `start_time`, `start_video`, `updated_at`, `last_updated_by`
**Update Progress**     | `STARTED`           | `IN_PROGRESS` | `status`, `updated_at`, `last_updated_by`
**Complete Task**       | `IN_PROGRESS`       | `COMPLETED`   | `status`, `end_time`, `end_video`, `comments`, `products_used`, `updated_at`, `last_updated_by`
**Restart Task**        | `REVISION_REQUIRED` | `STARTED`     | `status`, `start_time`, `start_video`, `updated_at`, `last_updated_by`

### System Actions

Action                | From State          | To State  | Fields Updated
--------------------- | ------------------- | --------- | ----------------------
**Send Notification** | `ASSIGNED`          | `PENDING` | `status`, `updated_at`
**Escalate Task**     | `PENDING` (timeout) | `URGENT`  | `status`, `updated_at`

## Sample Queries

### Get Current Task State

```sql
-- Get a specific task
SELECT * FROM tasks WHERE id = 'task_1641234567890_abc123';

-- Get all tasks for a cleaner
SELECT * FROM tasks 
WHERE assigned_cleaner_id = '1' 
  AND status IN ('PENDING', 'CONFIRMED', 'STARTED', 'IN_PROGRESS');

-- Get tasks by status
SELECT * FROM tasks 
WHERE status = 'URGENT' 
ORDER BY created_at ASC;

-- Get completed tasks for reporting
SELECT * FROM tasks 
WHERE status = 'COMPLETED' 
  AND date >= '2024-01-01' 
  AND date <= '2024-01-31';
```

### Update Task Status

```sql
-- Admin assigns task
UPDATE tasks 
SET status = 'ASSIGNED', 
    assigned_cleaner_id = '1', 
    updated_at = NOW(), 
    last_updated_by = 'admin_1'
WHERE id = 'task_1641234567890_abc123';

-- Cleaner accepts task
UPDATE tasks 
SET status = 'CONFIRMED', 
    comments = 'I can do this task', 
    updated_at = NOW(), 
    last_updated_by = '1'
WHERE id = 'task_1641234567890_abc123';

-- Cleaner starts task
UPDATE tasks 
SET status = 'STARTED', 
    start_time = NOW(), 
    start_video = 'video_url_1', 
    updated_at = NOW(), 
    last_updated_by = '1'
WHERE id = 'task_1641234567890_abc123';

-- Cleaner completes task
UPDATE tasks 
SET status = 'COMPLETED', 
    end_time = NOW(), 
    end_video = 'video_url_2', 
    comments = 'Task completed successfully', 
    products_used = '["product_1", "product_2"]'::jsonb, 
    updated_at = NOW(), 
    last_updated_by = '1'
WHERE id = 'task_1641234567890_abc123';
```

## Business Rules

1. **Status Transitions**: Only allow valid state transitions as defined in the state machine
2. **Actor Permissions**: Validate that the correct actor type is performing the action
3. **Required Fields**: Ensure required fields are populated for each state
4. **Audit Trail**: Always update `updated_at` and `last_updated_by` on mutations
5. **Data Integrity**: Use database constraints to enforce valid status values

## Implementation Notes

1. **Validation**: Implement validation logic in your application to ensure valid state transitions
2. **Concurrency**: Use optimistic locking (version fields) or row-level locking for concurrent updates
3. **Triggers**: Consider database triggers to automatically update `updated_at` timestamps
4. **Indexing**: Ensure proper indexes for common query patterns
5. **History**: If audit history is needed, consider a separate `task_history` table

## Migration from Current System

1. Create the new `tasks` table
2. Migrate existing task data to the new structure
3. Update application code to use the new schema
4. Remove old event-based tables once migration is complete

This approach provides a simple, efficient way to manage task lifecycle with straightforward queries and updates.

# BRN-007 Installation Operations — 数据模型

## 核心实体

### InstallationJob
- id
- order_id
- status
- scheduled_start / scheduled_end
- timezone
- address_snapshot
- contact_snapshot
- instructions
- balance_due_snapshot
- assigned_team_id
- created_by / updated_by

### InstallationAssignment
- installation_job_id
- installer_user_id
- role
- accepted_at
- started_at
- completed_at

### InstallationStatusEvent
- installation_job_id
- from_status / to_status
- occurred_at
- actor_user_id
- source
- note
- optional_location

### InstallationMedia
- installation_job_id
- file_id
- media_type: before / during / after / issue
- captured_at
- uploaded_by
- checksum

### InstallationSignature
- installation_job_id
- signer_name
- signer_role
- signed_at
- signature_file_id
- acceptance_note

### InstallationIssue
- installation_job_id
- category
- severity
- description
- responsible_party
- status
- resolution
- follow_up_job_id

### InstallerTeam
- id
- name
- active
- members

## 关键约束
- 地址和联系人使用任务创建时的快照，客户主档后续修改不覆盖历史任务。
- 一个状态变化对应一条不可覆盖的事件记录。
- 完工必须满足配置的照片、签字或异常说明要求。
- 位置数据可空，只能在授权范围和任务时间内保存。
- 文件以 checksum 去重，但不得误合并不同任务中的业务记录。
- 取消和改期保留原任务历史，不直接删除。

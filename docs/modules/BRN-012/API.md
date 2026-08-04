# BRN-012 Knowledge Center — API 规范

## 1. 通用要求

- API 前缀：`/api/v4/knowledge`。
- 所有接口必须使用 Session 身份和服务端权限检查。
- 列表接口分页，默认 25，最大 100。
- 上传、发布、权限修改、归档和下载写入审计日志。
- 错误不得泄露存储密钥、数据库堆栈或内部文件路径。

## 2. 文档接口

### `GET /api/v4/knowledge/documents`

参数：`q`、`category`、`productType`、`status`、`language`、`tag`、`updatedFrom`、`page`、`pageSize`。

返回前必须按角色、订单分配、客户归属和文档规则过滤。

### `POST /api/v4/knowledge/documents`

创建资料主记录和首个上传会话。请求包含标题、分类、语言、标签、可见范围和关联对象；文件使用独立受控上传流程。

### `GET /api/v4/knowledge/documents/[id]`

返回当前用户可见的元数据、已发布版本、关联对象和解析状态。

### `PATCH /api/v4/knowledge/documents/[id]`

修改标题、分类、标签和可见范围。发布状态和版本不得通过普通 PATCH 静默改变。

## 3. 上传与版本

- `POST /api/v4/knowledge/documents/[id]/upload-session`
- `POST /api/v4/knowledge/documents/[id]/versions`
- `GET /api/v4/knowledge/documents/[id]/versions`
- `POST /api/v4/knowledge/versions/[versionId]/submit-review`
- `POST /api/v4/knowledge/versions/[versionId]/publish`
- `POST /api/v4/knowledge/versions/[versionId]/supersede`
- `POST /api/v4/knowledge/versions/[versionId]/archive`

发布和替代操作仅 Owner 或授权审核人可执行。上传完成后服务端重新计算 SHA-256 并校验文件。

## 4. 搜索

### `POST /api/v4/knowledge/search`

请求：

```json
{
  "query": "K 系列罗马帘价格和安装说明",
  "filters": {
    "categories": ["pricing", "installation"],
    "language": ["zh", "en"],
    "status": ["published"]
  },
  "limit": 20
}
```

响应包含：标题、片段、文档 ID、版本 ID、页码/工作表/单元格范围、更新时间、状态、权限范围和链接。

搜索实现必须先应用权限范围，再进行关键词和语义排序。默认不返回草稿和已替代内容。

## 5. 预览与下载

- `GET /api/v4/knowledge/versions/[versionId]/preview`
- `POST /api/v4/knowledge/versions/[versionId]/download-link`

下载链接短时有效且绑定当前用户。Customer 只能下载 customer-visible 的安全发布版本。

## 6. 关联对象

- `POST /api/v4/knowledge/documents/[id]/links`
- `DELETE /api/v4/knowledge/documents/[id]/links/[linkId]`
- `GET /api/v4/orders/[orderNumber]/knowledge`
- `GET /api/v4/products/[productId]/knowledge`

关联不自动放宽权限。资料与多个对象关联时使用最严格有效权限。

## 7. 审核与冲突

- `GET /api/v4/knowledge/review-queue`
- `POST /api/v4/knowledge/versions/[versionId]/review`
- `GET /api/v4/knowledge/conflicts`
- `POST /api/v4/knowledge/conflicts/[id]/resolve`

审核记录应包含决定、备注、审核人和时间。价格、工艺或安装说明冲突不得由 AI 自动裁决。

## 8. AI 检索工具

### `knowledge_search`

只读工具，参数为查询、业务上下文和限制。返回经过权限过滤的片段及精确来源。

### `get_knowledge_source`

读取指定可访问版本的有限上下文，不返回整个大型文件。

AI 工具不得提供任意文件路径、任意 URL 获取或绕过权限的全文下载能力。

## 9. 索引管理

- `GET /api/v4/knowledge/versions/[versionId]/index-status`
- `POST /api/v4/knowledge/versions/[versionId]/reindex`

仅 Owner 可重建索引。重建必须幂等，并保留索引模型版本和错误信息。

## 10. 幂等与限制

上传完成、创建版本、发布和重建索引必须支持幂等键。限制文件大小、批量上传数量、搜索频率和单次返回片段数，防止成本和资源失控。
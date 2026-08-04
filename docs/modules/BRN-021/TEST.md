# BRN-021 Acceptance Tests

## Product data
- 中英文名称、SKU、系列、型号、单位和状态正确保存。
- Shutters 和 Blinds 可作为独立产品分类搜索、筛选和停用。
- 停用产品仍能在历史 Quote、Invoice 和订单中显示。
- 客户不可查看成本、利润、内部备注和隐藏媒体。

## Shutters
- Wood、Composite、Poly/PVC 等材质正确保存。
- Panel 数量与结构、Louver 尺寸、Frame、Divider Rail、Tilt Rod、Hinge、颜色和特殊形状正确保存。
- 缺少必选 Panel、Louver 或 Frame 时禁止正式报价。
- 不兼容的 Panel/Frame/Louver/Shape 组合显示明确错误。
- 标准窗、拱形窗和特殊开孔的价格规则与附加费可复核。

## Blinds
- Wood、Faux Wood、Aluminum 和 Vertical Blinds 正确分类。
- 横向/竖向、Slat/Vane 尺寸、Lift、Tilt、Valance、梯带和颜色正确保存。
- 不兼容的材质、叶片尺寸、控制方式或 Valance 组合被拦截。
- 超过产品最大宽高或控制系统限制时显示明确错误。

## Configuration
- IB/OB、单层/双层、无绳/拉珠/电动、内衬和面料兼容规则正确。
- 缺少必选项或存在冲突时禁止正式报价。
- 尺寸超过产品、电机、面料或运输限制时显示明确错误。

## Pricing
- Braun、Jin、KT 和手工价格来源不混用。
- Shutters 可按平方英尺、尺寸表或基础价加选项规则计算，并显示 Panel、Louver、Frame 和特殊形状明细。
- Blinds 可按尺寸表、平方英尺或基础价加选项规则计算，并显示材质、Slat/Vane、控制与 Valance 明细。
- 双层倍率和附加费按已发布规则计算。
- USD 与 RMB 不直接相加。
- 最低价、折扣、税和安装费计算可复核。
- 同样输入与同一规则版本产生相同结果。
- 新价格版本发布后，历史 Quote 金额保持不变。

## Overrides and approvals
- Sales 改价需填写原因；超过权限范围进入审批。
- Owner 可批准或拒绝，并保存原价、改后价和操作人。
- 重复提交不会产生多个审批或多个价格快照。

## Import and versioning
- Excel 导入先预览，错误行不进入正式价格表。
- Shutters 与 Blinds 的产品类型、规格、价格版本和币种能正确识别。
- 重复文件和重复版本被识别。
- 回滚只撤销对应导入批次，不影响后续人工修改。
- 已发布价格表不可原地覆盖。

## Security and audit
- 修改 URL 或 API 参数不能访问无权产品或成本。
- AI、Workflow 和计算器使用调用者权限与已发布版本。
- 创建、修改、审批、发布、停用和计算全部写入审计日志。

## Release gate
- Shutters 和 Blinds 各使用至少三个真实尺寸与配置完成价格对照测试。
- 关键产品真实样本通过 Braun/Jin 价格对照测试。
- 手机、平板、电脑和中英文页面通过。
- staging 数据迁移、备份和回滚测试完成后才能 production。
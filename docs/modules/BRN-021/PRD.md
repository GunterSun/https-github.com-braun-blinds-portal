# BRN-021 Product / Pricing / Catalog Center — PRD

## 目标
建立 Braun Smart Portal 的唯一产品与价格来源，统一罗马帘、布艺窗帘、卷帘、斑马帘、蜂巢帘、Shutters、Blinds、轨道、电机、窗帘杆、面料、配件和安装服务。

## 产品范围
- Roman Shades：罗马帘及单层、双层、无绳、拉珠、电动和内衬配置。
- Drapery：布艺窗帘、帘头、轨道、窗帘杆和配件。
- Roller / Zebra / Cellular Shades：卷帘、斑马帘和蜂巢帘。
- Shutters：Wood、Composite、Poly/PVC 等材质；Panel 数量、Louver 尺寸、Frame、Divider Rail、Tilt Rod、Hinge、颜色和特殊开孔。
- Blinds：Wood Blinds、Faux Wood Blinds、Aluminum Blinds、Vertical Blinds；Slat/Vane 尺寸、控制方式、Valance、颜色、梯带和安装方式。
- Motors / Tracks / Hardware：电机、轨道、窗帘杆、安装件及其他配件。

## 核心能力
- 产品分类、系列、型号、SKU、可选项和兼容规则。
- 中英文名称、说明、图片、PDF、视频及安装资料。
- 面料品牌、系列、颜色、图案、批次、幅宽、成本和状态。
- Shutters 保存材质、面板结构、百叶片尺寸、框型、分隔轨、倾斜控制、合页方向和特殊造型。
- Blinds 保存材质、横向/竖向类型、叶片尺寸、提升与调光方式、帘头和装饰选项。
- Braun、Jin、KT及其他价格来源分开管理。
- 零售价、批发价、成本价、折扣、加价、最低价和安装费规则。
- 单层、双层、内装、外装、电动、无绳、内衬及特殊工艺规则。
- Shutters 和 Blinds 支持按平方英尺、尺寸表、基础价加选项或分段公式计价。
- 价格表版本、有效期、审批、发布和历史追溯。
- Quote 必须锁定产品与价格规则版本，后续改价不得改变历史报价。
- 产品停用后保留历史订单引用，不得直接删除。
- 客户门户仅显示允许公开的产品、图片和价格。

## 关键业务规则
1. USD 与 RMB 金额必须保存币种，不得直接相加。
2. 双层产品必须使用明确的组合或倍率规则，不能靠页面临时计算。
3. Shutters 的 Panel、Louver、Frame、Divider Rail 和特殊开孔必须作为正式配置和价格输入保存。
4. Blinds 的材质、Slat/Vane 尺寸、控制方式和 Valance 必须经过兼容性校验。
5. 手工改价必须保存原价、改后价、原因和操作人。
6. 未批准或已过期价格表不能用于正式 Quote。
7. AI 只能读取已发布规则；不得自行编造价格。
8. Excel 导入先进入暂存区，经审核后才能发布。

## 角色
- Owner：全部管理、审批和发布。
- Sales：查看已发布产品与价格，在权限范围内申请改价。
- Factory：查看生产需要的产品规格和允许显示的成本信息。
- Installer：查看安装相关规格和说明。
- Customer：查看公开目录及其等级允许的价格。

## 验收结果
产品中心上线后，测量、计算器、Quote、Invoice、订单、采购、库存和 AI 使用同一产品与价格版本，并完整支持 Shutters 和 Blinds。
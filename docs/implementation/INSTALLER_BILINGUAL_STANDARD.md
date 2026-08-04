# Installer App Bilingual Standard / 安装工端中英文标准

## 目标 / Goal
安装工端必须完整支持 English / 中文切换，并且同一安装任务在两种语言下读取同一份真实数据。语言切换不得复制订单、改变状态或生成两套记录。

## 用户语言 / User language
- 每个安装工可设置默认语言：`en` 或 `zh-CN`。
- 登录后自动使用个人默认语言。
- 页面右上角提供 `English / 中文` 即时切换。
- 切换语言后保留当前订单、窗位、表单草稿和上传进度。
- 系统状态代码、产品 ID、订单 ID 和 Window ID 不随语言变化。

## 安装任务首页 / Installation task home
必须双语显示：
- Today’s Installations / 今日安装
- Upcoming / 即将安装
- Completed / 已完成
- Rework / 返工
- Order Number / 订单号
- Customer / 客户
- Installation Address / 安装地址
- Contact / 联系人
- Phone / 电话
- Scheduled Time / 安装时间
- Balance Alert / 欠款提示
- Navigation / 导航
- Call Customer / 联系客户

安装工只能看到与任务有关的欠款提示，例如 `Balance due before completion / 完工前有尾款待收`，不能看到成本、利润、工厂付款和内部财务明细。

## 产品与窗位 / Product and window
每个 Room / 房间、Window / 窗位必须双语显示：
- Product / 产品
- Quantity / 数量
- Width / 宽度
- Height / 高度
- Depth / 深度
- Mount Type / 安装方式
- Inside Mount / 内装
- Outside Mount / 外装
- Fabric / 面料
- Color / 颜色
- Control / 控制方式
- Motor / 电机
- Track / 轨道
- Hardware / 五金配件
- Special Instructions / 特殊说明

尺寸显示必须遵守 Braun Measurement Standard：
- 整英寸显示 `72"`。
- 有分数显示 `72 5/16"`。
- `0/16` 不显示。
- 不显示十进制尺寸。

## 安装流程 / Installation workflow
状态与按钮必须双语：
- Assigned / 已分配
- Confirmed / 已确认
- En Route / 已出发
- Arrived / 已到达
- Installation Started / 开始安装
- Paused / 已暂停
- Installation Completed / 安装完成
- Unable to Complete / 无法完成
- Customer Not Home / 客户不在
- Missing Parts / 缺少配件
- Wrong Size / 尺寸错误
- Damaged Product / 产品损坏
- Site Condition Issue / 现场条件问题
- Rework Required / 需要返工

所有状态写入使用统一代码，例如 `EN_ROUTE`，中英文只是显示文本。

## 安装检查表 / Installer checklist
开始安装前：
- Verify address / 核对地址
- Verify product quantity / 核对产品数量
- Verify room and window / 核对房间与窗位
- Verify hardware / 核对五金配件
- Verify motor and remote / 核对电机与遥控器
- Verify tools / 核对工具
- Review special instructions / 查看特殊说明

完工前：
- Test operation / 测试运行
- Confirm alignment / 确认水平与对齐
- Confirm safety devices / 确认安全装置
- Clean work area / 清理现场
- Upload completion photos / 上传完工照片
- Record exceptions / 记录异常
- Obtain customer signature / 获取客户签名

## 照片与文件 / Photos and files
上传类型必须双语：
- Before Installation / 安装前
- During Installation / 安装中
- After Installation / 安装后
- Damage / 损坏
- Missing Part / 缺件
- Site Condition / 现场情况
- Customer Approval / 客户确认

照片说明可输入中文或英文，AI 可辅助翻译，但不得修改原始说明。

## 客户签名 / Customer signature
安装完工签名页面必须支持中英文，至少包含：
- Installation Completion Confirmation / 安装完工确认
- Products installed and tested / 产品已安装并测试
- Visible condition accepted / 外观状态已确认
- Exceptions listed below / 异常已在下方列明
- Customer Name / 客户姓名
- Customer Signature / 客户签名
- Date and Time / 日期与时间

签名必须绑定安装任务版本、订单号、窗位、完工照片清单和签署时间。安装工不得代替客户签名。

## 异常报告 / Exception report
异常表单必须双语，并保存：
- Issue Type / 问题类型
- Room / 房间
- Window / 窗位
- Description / 问题说明
- Photos / 照片
- Temporary Resolution / 临时处理
- Parts Needed / 所需配件
- Follow-up Required / 是否需要跟进
- Customer Notified / 已通知客户

## 离线与弱网 / Offline and poor network
- 中英文资源必须可离线使用。
- 弱网时保存本地草稿并显示 `Pending Sync / 等待同步`。
- 语言切换不得清除未同步照片、签名或检查表。
- 重复同步必须幂等，不能生成两次完工记录。

## 权限与隐私 / Permissions and privacy
- Installer 只能看到本人或所属团队的安装任务。
- 不显示客户完整财务历史、内部成本、利润、供应商付款和其他安装工任务。
- GPS 仅在用户授权且任务进行期间使用。
- 电话、地址、门禁信息仅在任务必要范围显示。

## 技术要求 / Technical requirements
- 所有文字从统一语言资源读取，不允许在页面组件中写死中英文。
- 至少建立 `locales/en/installer` 和 `locales/zh-CN/installer`。
- API 返回稳定代码和结构化数据，不返回依赖语言的业务状态。
- PDF、安装清单和客户签名确认可生成 English、中文或 Bilingual 版本。
- 产品自定义说明应保存原文与可选翻译，不能用翻译覆盖原文。

## 验收标准 / Acceptance criteria
1. 同一安装工可在任务进行中切换中英文，数据和草稿不丢失。
2. 中英文下订单号、Window ID、尺寸、产品数量和状态完全一致。
3. 所有尺寸显示为整数英寸加可选 `/16` 分数，`0/16` 不显示。
4. 安装工无法通过 URL 或 API 查看未分配任务和内部财务数据。
5. 检查表、照片、异常、客户签名和完工记录均可在中英文界面完成。
6. 客户签名确认可生成中英文双语 PDF。
7. 手机、平板和电脑通过响应式测试。
8. 离线草稿、恢复同步和重复提交测试通过。

本标准为 V1 安装工端发布阻塞项；未完成中英文和权限验收，不得标记 Installer App 已正式上线。

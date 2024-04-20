# Bark Webhook for Deno Deploy

自用的 Bark Webhook，运行在 Deno Deploy 上，用于推送消息到 iOS 设备。

> [!IMPORTANT]
> 不兼容官方 Bark Server，只是使用了 Bark 客户端的接收能力，与官方的 Bark Server 路由不同，但参数基本一致。

## 使用

1. [Fork](https://github.com/vikiboss/bark-server-deno/fork) 本项目并点个 Star，然后免费部署项目到 [Deno Deploy](http://https://dash.deno.com)
2. [可选] 在项目设置页配置 DNS，绑定自己的域名
3. 在 iOS 设备上安装 `Bark` 客户端，并在 APP 设置页复制 Device Token
4. 在项目设置页配置 Deno 的环境变量

- `BARK_KEY`: 访问 Webhook 的鉴权密钥
- `BARK_DEVICE_***`: 刚复制的 Device Token

> `***` 为后续调用 webhook 的 `device_key`/`target`，单设备唯一，可添加多个，按 key 区分。

然后访问 https://your-deploy-domain.com/push?key=your-bark-key&device_key=***&title=Hello&body=World 即可推送消息到你的 iOS 设备。

## 参数

- `device_key` (或 `target`): 设备标识，对应 `BARK_DEVICE_***` 中的 `***`
- `title`: 消息标题
- `body`: 消息内容
- `device_token`: 设备 Token，与 `device_key` 二选一，未配置环境变量时可以通过这个参数手动指定

其他参数请参考此项目的垃圾源码，又不是不能用。

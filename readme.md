# Bark Webhook for Deno Deploy

自用的 Bark Webhook，运行在 Deno Deploy 上，用于推送消息到 iOS 设备。

> [!IMPORTANT]
> 不兼容官方 Bark Server，只是使用了 Bark iOS 客户端的接收能力，与官方的 Bark Server 路由不同，但参数基本一致。

## 部署

1. [Fork](https://github.com/vikiboss/bark-server-deno/fork) 本项目~~并点个 Star~~，然后免费部署到 [Deno Deploy](http://https://dash.deno.com)
2. [可选] 在 Deno Deploy 项目设置页绑定自己的域名，需要配置域名 DNS 解析到 Deno Deploy
3. 在 iOS 设备上安装 Bark 客户端，并在 APP 设置页复制 Device Token
4. 在 Deno Deploy 项目设置页配置环境变量

- `BARK_KEY`: 访问 Webhook 的鉴权密钥
- `BARK_DEVICE_<device_key>`: 刚复制的 Device Token

> `<device_key>` 为后续调用 Webhook 的 `device_key`，单设备唯一，可添加多个，按 key 区分。

## 使用

```bash
# 推送示例
curl https://your-deploy-domain.com/push?key=BARK_KEY&device_key=BARK_DEVICE_<device_key>&title=Hello&body=World

# 查看设备列表
https://your-deploy-domain.com/status?key=BARK_KEY
```

## 参数

- `key`: 鉴权密钥，对应 `BARK_KEY` 环境变量
- `device_key`: 设备标识，对应 `BARK_DEVICE_<device_key>` 环境变量名字中的 `<device_key>`
- `title`: 消息标题
- `body`: 消息内容
- `device_token`: 手动指定设备 Token，与 `device_key` 二选一，未配置环境变量时可以通过这个参数临时指定

其他参数请参考此项目的垃圾源码，又不是不能用 🤷。

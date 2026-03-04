// 测试环境变量设置
console.log('process.env.NODE_ENV:', process.env.NODE_ENV)
console.log('development check:', process.env.NODE_ENV !== "production")

// 模拟Vue的条件判断
const isDev = !!(process.env.NODE_ENV !== "production")
console.log('isDev:', isDev)

if (isDev) {
  console.log('开发环境代码执行了')
} else {
  console.log('生产环境模式')
}
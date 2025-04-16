//var io = new IntersectionObserver(callback, option);

function loadImage(target: HTMLImageElement) {
    //     懒加载的目的：---------------核心部分

    // 在懒加载实现中，图片的 src 属性通常不会在页面加载时直接设置。为了避免图片一开始就被加载，我们会将图片的 URL 存储在 data-src 中。
    // 当图片进入视口时，IntersectionObserver 会触发回调函数，这时我们就可以读取 data-src 中存储的图片 URL，并将其赋值给 src 属性，触发浏览器加载图片。
    // target.dataset.src：

    // target.dataset 是一个访问 DOM 元素 data-* 属性的方式。假设图片元素 <img> 的 data-src 属性存储了图片的 URL：
    // <img data-src="https://example.com/image.jpg" alt="Image" />
    // target.dataset.src 会获取到这个 data-src 属性的值，也就是图片的实际 URL。
    target.src = target.dataset.src ?? '';
    ////给dom赋予 src-- dom自动发送网络请求
    //**********我们的src实际上是发送网络请求获得的资源 */

    // 这里使用了 JavaScript 的空值合并运算符（??）。如果 target.dataset.src 是 null 或 undefined（即如果 data-src 属性没有值），那么会使用空字符串 '' 作为 src 的值。
    console.log(target.dataset, 'target.dataset')
}

function callback(entries: IntersectionObserverEntry[], observer: IntersectionObserver) {
    //   为所有被观察目标添加指定的回调
    entries.forEach(entry => {
        if (entry.isIntersecting) {

            console.log('进入')
            loadImage(entry.target as HTMLImageElement);
            observer.unobserve(entry.target);//// 加载后取消观察
            // return
        }
        // console.log('load image', entry.target);

    })
}
//回调中的参数是一个entires对象，这个entires对象就是我们的被观察目标的数组。每个被观察目标都会有信息

// time：可见性发生变化的时间，是一个高精度时间戳，单位为毫秒
// target：被IntersectionObserver 观察的目标元素，是一个 DOM 节点对象
// rootBounds：根元素的矩形区域的信息，getBoundingClientRect()方法的返回值，如果没有根元素（即直接相对于视口滚动），则返回null
// boundingClientRect：目标元素的矩形区域的信息
// intersectionRect：目标元素与视口（或根元素）的交叉区域的信息
// intersectionRatio：目标元素的可见比例，即intersectionRect占boundingClientRect的比例，完全可见时为1，完全不可见时小于等于0

const options = {
    root: null, // 默认为视窗
    rootMargin: '100px 0px', // 在计算交叉度时，扩大或缩小root的边界   top、right、bottom 和 left 提前量
    threshold: 0 // 当目标元素10%的部分进入视窗时触发回调

}

function createIntersectionObserver() {
    const observer = new IntersectionObserver(callback, options);
    console.log('createIntersectionObserver实例创建')
    return observer;
}

const observer = createIntersectionObserver();

//外边调用useIntersectionObserver() 那就是直接拿到 observer ，createIntersectionObserver()只会实现一次
export function useIntersectionObserver() {
    return {
        observer
    };
}



// 我将创建实例的方法 封装成了一个useIntersection 的hooks，这样能够方便复用。


// 注意：IntersectionObserver API 是异步的，是一个微任务，不随着目标元素的滚动同步触发。

// 确实，IntersectionObserver API 是异步的，并且它不会随着目标元素滚动而同步触发观察回调。这个特性使得它非常适合用于实现诸如无限滚动、懒加载图像或在元素进入视口时执行动画等场景，因为它允许浏览器优化这些操作，避免频繁的重绘或布局计算，从而提高性能。

// 以下是关于 IntersectionObserver 的一些关键点：

// 异步行为
// 当被观察的元素与视口（或指定的根元素）的交集状态发生变化时，IntersectionObserver 不会立即触发回调函数。相反，它会在当前的调用堆栈清空之后，在一个微任务中执行回调。
// 这意味着即使你快速滚动页面，导致目标元素多次进出视口，IntersectionObserver 也会批量处理这些变化，而不是每次变化都立即响应，这样可以减少不必要的计算和渲染。
import { LambdaRestApi } from "aws-cdk-lib/aws-apigateway";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

interface SwnApiGatewayProps {
    productMicroservice: IFunction,
    basketMicroservice: IFunction,
    orderingMicroservices: IFunction
}

export class SwnApiGateway extends Construct{

    constructor(scope: Construct, id: string, props: SwnApiGatewayProps) {
        super(scope, id);

        // Product api gateway
        this.createProductApi(props.productMicroservice);
        // Basket api gateway
        this.createBasketApi(props.basketMicroservice);
        // Ordering api gateway
        this.createOrderApi(props.orderingMicroservices);
    }

    private createProductApi(productMicroservice: IFunction){

        const apigw = new LambdaRestApi(this, 'productApi', {
            restApiName: 'Product Service',
            handler: productMicroservice,
            proxy: false
        });

        const product = apigw.root.addResource('product');
        product.addMethod('GET');
        product.addMethod('POST');

        const singleProduct = product.addResource('{id}'); // product/{id}
        singleProduct.addMethod('GET');
        singleProduct.addMethod('PUT');
        singleProduct.addMethod('DELETE');
    }

    private createBasketApi(basketMicroservice: IFunction) {
        const apigw = new LambdaRestApi(this, 'basketApi', {
            restApiName: 'Basket Service',
            handler: basketMicroservice,
            proxy: false
        });

        const basket = apigw.root.addResource('basket');
        basket.addMethod('GET');  // GET /basket
        basket.addMethod('POST');  // POST /basket

        const singleBasket = basket.addResource('{userName}');
        singleBasket.addMethod('GET');  // GET /basket/{userName}
        singleBasket.addMethod('DELETE'); // DELETE /basket/{userName}

        const basketCheckout = basket.addResource('checkout');
        basketCheckout.addMethod('POST'); // POST /basket/checkout
    }

    private createOrderApi(orderingMicroservices: IFunction) {
        // Ordering microservices api gateway
        // root name = order

        const apigw = new LambdaRestApi(this, 'orderApi', {
            restApiName: 'Order Service',
            handler: orderingMicroservices,
            proxy: false
        });
    
        const order = apigw.root.addResource('order');
        order.addMethod('GET');  // GET /order        
    
        const singleOrder = order.addResource('{userName}');
        singleOrder.addMethod('GET');  // GET /order/{userName}
            // expected request : xxx/order/swn?orderDate=timestamp
            // ordering ms grap input and query parameters and filter to dynamo db
    
        return singleOrder;
    }

} 

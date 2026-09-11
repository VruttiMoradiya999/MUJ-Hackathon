import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer.jsx';
import ProductDetails from '../components/products/ProductDetails.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import LoadingState from '../components/ui/LoadingState.jsx';
import Button from '../components/ui/Button.jsx';
import { useProduct } from '../hooks/useProducts.js';
import { ArrowLeft } from 'lucide-react';

export function ProductDetailPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useProduct(productId);

  const product = data?.product;

  if (loading) {
    return (
      <PageContainer title="Product Details" subtitle="Loading SKU…">
        <LoadingState rows={5} />
      </PageContainer>
    );
  }

  if (error || !product) {
    return (
      <PageContainer title="Product Details" subtitle="SKU specification">
        <ErrorState
          title="Product not found"
          message={error?.message || `No product found for ID ${productId}.`}
          onRetry={refetch}
        />
        <div className="mt-4 flex justify-center">
          <Button variant="secondary" size="sm" icon={ArrowLeft} onClick={() => navigate('/products')}>
            Back to Products
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title={product.name}
      subtitle={`${product.category} • SKU ${product.sku}`}
      action={
        <Button variant="secondary" size="sm" icon={ArrowLeft} onClick={() => navigate('/products')}>
          Back
        </Button>
      }
    >
      <ProductDetails product={product} />
    </PageContainer>
  );
}

export default ProductDetailPage;

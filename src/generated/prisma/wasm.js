
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.GarmentTypeScalarFieldEnum = {
  id: 'id',
  name: 'name',
  slug: 'slug',
  order: 'order',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CategoryGarmentTypeScalarFieldEnum = {
  categoryId: 'categoryId',
  garmentTypeId: 'garmentTypeId'
};

exports.Prisma.ProductGarmentTypeScalarFieldEnum = {
  productId: 'productId',
  garmentTypeId: 'garmentTypeId'
};

exports.Prisma.ProductCategoryScalarFieldEnum = {
  productId: 'productId',
  categoryId: 'categoryId'
};

exports.Prisma.AccountScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  type: 'type',
  provider: 'provider',
  providerAccountId: 'providerAccountId',
  refresh_token: 'refresh_token',
  access_token: 'access_token',
  expires_at: 'expires_at',
  token_type: 'token_type',
  scope: 'scope',
  id_token: 'id_token',
  session_state: 'session_state'
};

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  name: 'name',
  email: 'email',
  emailVerified: 'emailVerified',
  image: 'image',
  password: 'password',
  role: 'role',
  phone: 'phone',
  cedula: 'cedula',
  recoveryEmail: 'recoveryEmail',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.EmailVerificationTokenScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  codeHash: 'codeHash',
  expires: 'expires',
  attempts: 'attempts',
  createdAt: 'createdAt'
};

exports.Prisma.PasswordResetTokenScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  codeHash: 'codeHash',
  expires: 'expires',
  attempts: 'attempts',
  verified: 'verified',
  createdAt: 'createdAt'
};

exports.Prisma.PendingRegistrationScalarFieldEnum = {
  id: 'id',
  name: 'name',
  email: 'email',
  passwordHash: 'passwordHash',
  phone: 'phone',
  recoveryEmail: 'recoveryEmail',
  codeHash: 'codeHash',
  expires: 'expires',
  attempts: 'attempts',
  createdAt: 'createdAt'
};

exports.Prisma.AddressScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  fullName: 'fullName',
  cedula: 'cedula',
  phone: 'phone',
  department: 'department',
  city: 'city',
  address: 'address',
  addressDetail: 'addressDetail',
  zipCode: 'zipCode',
  isDefault: 'isDefault',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CategoryScalarFieldEnum = {
  id: 'id',
  name: 'name',
  slug: 'slug',
  description: 'description',
  image: 'image',
  order: 'order',
  isActive: 'isActive',
  metaTitle: 'metaTitle',
  metaDescription: 'metaDescription',
  parentId: 'parentId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ProductScalarFieldEnum = {
  id: 'id',
  name: 'name',
  slug: 'slug',
  description: 'description',
  basePrice: 'basePrice',
  comparePrice: 'comparePrice',
  status: 'status',
  isFeatured: 'isFeatured',
  isNew: 'isNew',
  isProductNew: 'isProductNew',
  isProductNewAt: 'isProductNewAt',
  isOnSale: 'isOnSale',
  isOnSaleAt: 'isOnSaleAt',
  metaTitle: 'metaTitle',
  metaDescription: 'metaDescription',
  videoUrl: 'videoUrl',
  rating: 'rating',
  numReviews: 'numReviews',
  isSet: 'isSet',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ProductColorScalarFieldEnum = {
  id: 'id',
  productId: 'productId',
  name: 'name',
  hexCode: 'hexCode'
};

exports.Prisma.ProductImageScalarFieldEnum = {
  id: 'id',
  productId: 'productId',
  url: 'url',
  altText: 'altText',
  order: 'order',
  isCover: 'isCover',
  colorId: 'colorId',
  createdAt: 'createdAt'
};

exports.Prisma.ProductVariantScalarFieldEnum = {
  id: 'id',
  productId: 'productId',
  colorId: 'colorId',
  size: 'size',
  sku: 'sku',
  priceOverride: 'priceOverride',
  stock: 'stock',
  minStock: 'minStock',
  reserved: 'reserved',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ProductItemScalarFieldEnum = {
  id: 'id',
  productId: 'productId',
  name: 'name',
  description: 'description',
  price: 'price',
  comparePrice: 'comparePrice',
  videoUrl: 'videoUrl',
  order: 'order',
  createdAt: 'createdAt'
};

exports.Prisma.ProductItemColorScalarFieldEnum = {
  id: 'id',
  itemId: 'itemId',
  name: 'name',
  hexCode: 'hexCode'
};

exports.Prisma.ProductItemImageScalarFieldEnum = {
  id: 'id',
  colorId: 'colorId',
  url: 'url',
  altText: 'altText',
  order: 'order',
  isCover: 'isCover'
};

exports.Prisma.ProductItemVariantScalarFieldEnum = {
  id: 'id',
  colorId: 'colorId',
  size: 'size',
  sku: 'sku',
  stock: 'stock',
  isActive: 'isActive'
};

exports.Prisma.StockReservationScalarFieldEnum = {
  id: 'id',
  variantId: 'variantId',
  quantity: 'quantity',
  expiresAt: 'expiresAt',
  released: 'released',
  createdAt: 'createdAt'
};

exports.Prisma.OrderScalarFieldEnum = {
  id: 'id',
  orderNumber: 'orderNumber',
  userId: 'userId',
  addressId: 'addressId',
  shippingName: 'shippingName',
  shippingAddress: 'shippingAddress',
  shippingCity: 'shippingCity',
  shippingDepartment: 'shippingDepartment',
  shippingPhone: 'shippingPhone',
  shippingCedula: 'shippingCedula',
  subtotal: 'subtotal',
  shippingCost: 'shippingCost',
  discount: 'discount',
  total: 'total',
  status: 'status',
  paymentMethod: 'paymentMethod',
  transactionId: 'transactionId',
  boldLinkId: 'boldLinkId',
  paymentId: 'paymentId',
  paymentExpiresAt: 'paymentExpiresAt',
  trackingNumber: 'trackingNumber',
  trackingUrl: 'trackingUrl',
  appliedCouponId: 'appliedCouponId',
  paidAt: 'paidAt',
  shippedAt: 'shippedAt',
  deliveredAt: 'deliveredAt',
  cancelledAt: 'cancelledAt',
  confirmationEmailSentAt: 'confirmationEmailSentAt',
  confirmationEmailFailedAt: 'confirmationEmailFailedAt',
  confirmationEmailError: 'confirmationEmailError',
  abandonedCheckoutEmailSentAt: 'abandonedCheckoutEmailSentAt',
  reviewRequestEmailSentAt: 'reviewRequestEmailSentAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.OrderItemScalarFieldEnum = {
  id: 'id',
  orderId: 'orderId',
  productId: 'productId',
  variantId: 'variantId',
  name: 'name',
  sku: 'sku',
  colorName: 'colorName',
  size: 'size',
  price: 'price',
  quantity: 'quantity',
  total: 'total',
  imageUrl: 'imageUrl'
};

exports.Prisma.CartScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  abandonedEmailSentAt: 'abandonedEmailSentAt',
  updatedAt: 'updatedAt',
  createdAt: 'createdAt'
};

exports.Prisma.CartItemScalarFieldEnum = {
  id: 'id',
  cartId: 'cartId',
  productId: 'productId',
  variantId: 'variantId',
  sku: 'sku',
  name: 'name',
  price: 'price',
  imageUrl: 'imageUrl',
  color: 'color',
  size: 'size',
  quantity: 'quantity'
};

exports.Prisma.ReviewScalarFieldEnum = {
  id: 'id',
  productId: 'productId',
  userId: 'userId',
  guestName: 'guestName',
  orderId: 'orderId',
  rating: 'rating',
  comment: 'comment',
  status: 'status',
  reviewToken: 'reviewToken',
  reviewTokenUsed: 'reviewTokenUsed',
  reviewTokenExpiresAt: 'reviewTokenExpiresAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CouponBatchScalarFieldEnum = {
  id: 'id',
  discountPercentage: 'discountPercentage',
  quantity: 'quantity',
  createdById: 'createdById',
  createdAt: 'createdAt'
};

exports.Prisma.CouponScalarFieldEnum = {
  id: 'id',
  code: 'code',
  kind: 'kind',
  discountType: 'discountType',
  discountValue: 'discountValue',
  discountPercentage: 'discountPercentage',
  assignedEmail: 'assignedEmail',
  isUsed: 'isUsed',
  usedAt: 'usedAt',
  usedByOrderId: 'usedByOrderId',
  batchId: 'batchId',
  maxGlobalUses: 'maxGlobalUses',
  maxUsesPerUser: 'maxUsesPerUser',
  currentGlobalUses: 'currentGlobalUses',
  expiresAt: 'expiresAt',
  scheduleMode: 'scheduleMode',
  validFrom: 'validFrom',
  validTo: 'validTo',
  isActive: 'isActive',
  codeSource: 'codeSource',
  label: 'label',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.CouponUsageScalarFieldEnum = {
  id: 'id',
  couponId: 'couponId',
  orderId: 'orderId',
  userId: 'userId',
  email: 'email',
  documentId: 'documentId',
  usedAt: 'usedAt'
};

exports.Prisma.PromoPopupScalarFieldEnum = {
  id: 'id',
  name: 'name',
  placement: 'placement',
  isActive: 'isActive',
  headline: 'headline',
  subtitle: 'subtitle',
  couponCode: 'couponCode',
  disclaimer: 'disclaimer',
  ctaText: 'ctaText',
  ctaUrl: 'ctaUrl',
  delaySeconds: 'delaySeconds',
  scheduleMode: 'scheduleMode',
  validFrom: 'validFrom',
  validTo: 'validTo',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.WebhookLogScalarFieldEnum = {
  id: 'id',
  orderId: 'orderId',
  provider: 'provider',
  eventType: 'eventType',
  payload: 'payload',
  signature: 'signature',
  status: 'status',
  errorMessage: 'errorMessage',
  attempt: 'attempt',
  createdAt: 'createdAt'
};

exports.Prisma.AdminNotificationScalarFieldEnum = {
  id: 'id',
  orderId: 'orderId',
  title: 'title',
  body: 'body',
  isRead: 'isRead',
  createdAt: 'createdAt'
};

exports.Prisma.ColorScalarFieldEnum = {
  id: 'id',
  name: 'name',
  hexCode: 'hexCode',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.HeroSlideScalarFieldEnum = {
  id: 'id',
  position: 'position',
  mediaUrl: 'mediaUrl',
  mediaType: 'mediaType',
  headline: 'headline',
  subheadline: 'subheadline',
  isActive: 'isActive',
  updatedAt: 'updatedAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};
exports.Role = exports.$Enums.Role = {
  USER: 'USER',
  ADMIN: 'ADMIN'
};

exports.ProductStatus = exports.$Enums.ProductStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  DRAFT: 'DRAFT'
};

exports.Size = exports.$Enums.Size = {
  XS: 'XS',
  S: 'S',
  M: 'M',
  L: 'L',
  XL: 'XL',
  XXL: 'XXL',
  ONESIZE: 'ONESIZE'
};

exports.OrderStatus = exports.$Enums.OrderStatus = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  PAID: 'PAID',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED'
};

exports.PaymentMethod = exports.$Enums.PaymentMethod = {
  BOLD: 'BOLD',
  ADDI: 'ADDI',
  NEQUI: 'NEQUI',
  BANCOLOMBIA: 'BANCOLOMBIA',
  DAVIPLATA: 'DAVIPLATA'
};

exports.ReviewStatus = exports.$Enums.ReviewStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED'
};

exports.CouponKind = exports.$Enums.CouponKind = {
  BATCH_SINGLE: 'BATCH_SINGLE',
  EMAIL_SINGLE: 'EMAIL_SINGLE',
  PROMOTIONAL: 'PROMOTIONAL'
};

exports.CouponDiscountType = exports.$Enums.CouponDiscountType = {
  PERCENTAGE: 'PERCENTAGE',
  FIXED: 'FIXED'
};

exports.CouponScheduleMode = exports.$Enums.CouponScheduleMode = {
  NONE: 'NONE',
  SINGLE_DAY: 'SINGLE_DAY',
  DATE_RANGE: 'DATE_RANGE'
};

exports.CouponCodeSource = exports.$Enums.CouponCodeSource = {
  RANDOM: 'RANDOM',
  CUSTOM: 'CUSTOM'
};

exports.PromoPopupPlacement = exports.$Enums.PromoPopupPlacement = {
  HOME: 'HOME',
  PRODUCT: 'PRODUCT',
  CHECKOUT: 'CHECKOUT'
};

exports.Prisma.ModelName = {
  GarmentType: 'GarmentType',
  CategoryGarmentType: 'CategoryGarmentType',
  ProductGarmentType: 'ProductGarmentType',
  ProductCategory: 'ProductCategory',
  Account: 'Account',
  User: 'User',
  EmailVerificationToken: 'EmailVerificationToken',
  PasswordResetToken: 'PasswordResetToken',
  PendingRegistration: 'PendingRegistration',
  Address: 'Address',
  Category: 'Category',
  Product: 'Product',
  ProductColor: 'ProductColor',
  ProductImage: 'ProductImage',
  ProductVariant: 'ProductVariant',
  ProductItem: 'ProductItem',
  ProductItemColor: 'ProductItemColor',
  ProductItemImage: 'ProductItemImage',
  ProductItemVariant: 'ProductItemVariant',
  StockReservation: 'StockReservation',
  Order: 'Order',
  OrderItem: 'OrderItem',
  Cart: 'Cart',
  CartItem: 'CartItem',
  Review: 'Review',
  CouponBatch: 'CouponBatch',
  Coupon: 'Coupon',
  CouponUsage: 'CouponUsage',
  PromoPopup: 'PromoPopup',
  WebhookLog: 'WebhookLog',
  AdminNotification: 'AdminNotification',
  Color: 'Color',
  HeroSlide: 'HeroSlide'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)

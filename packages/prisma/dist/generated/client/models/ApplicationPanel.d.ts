import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
/**
 * Model ApplicationPanel
 *
 */
export type ApplicationPanelModel = runtime.Types.Result.DefaultSelection<Prisma.$ApplicationPanelPayload>;
export type AggregateApplicationPanel = {
    _count: ApplicationPanelCountAggregateOutputType | null;
    _min: ApplicationPanelMinAggregateOutputType | null;
    _max: ApplicationPanelMaxAggregateOutputType | null;
};
export type ApplicationPanelMinAggregateOutputType = {
    id: string | null;
    guildId: string | null;
    channelId: string | null;
    messageId: string | null;
    title: string | null;
    description: string | null;
    color: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type ApplicationPanelMaxAggregateOutputType = {
    id: string | null;
    guildId: string | null;
    channelId: string | null;
    messageId: string | null;
    title: string | null;
    description: string | null;
    color: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type ApplicationPanelCountAggregateOutputType = {
    id: number;
    guildId: number;
    channelId: number;
    messageId: number;
    title: number;
    description: number;
    color: number;
    formIds: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type ApplicationPanelMinAggregateInputType = {
    id?: true;
    guildId?: true;
    channelId?: true;
    messageId?: true;
    title?: true;
    description?: true;
    color?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type ApplicationPanelMaxAggregateInputType = {
    id?: true;
    guildId?: true;
    channelId?: true;
    messageId?: true;
    title?: true;
    description?: true;
    color?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type ApplicationPanelCountAggregateInputType = {
    id?: true;
    guildId?: true;
    channelId?: true;
    messageId?: true;
    title?: true;
    description?: true;
    color?: true;
    formIds?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type ApplicationPanelAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which ApplicationPanel to aggregate.
     */
    where?: Prisma.ApplicationPanelWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of ApplicationPanels to fetch.
     */
    orderBy?: Prisma.ApplicationPanelOrderByWithRelationInput | Prisma.ApplicationPanelOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.ApplicationPanelWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` ApplicationPanels from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` ApplicationPanels.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned ApplicationPanels
    **/
    _count?: true | ApplicationPanelCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: ApplicationPanelMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: ApplicationPanelMaxAggregateInputType;
};
export type GetApplicationPanelAggregateType<T extends ApplicationPanelAggregateArgs> = {
    [P in keyof T & keyof AggregateApplicationPanel]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateApplicationPanel[P]> : Prisma.GetScalarType<T[P], AggregateApplicationPanel[P]>;
};
export type ApplicationPanelGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ApplicationPanelWhereInput;
    orderBy?: Prisma.ApplicationPanelOrderByWithAggregationInput | Prisma.ApplicationPanelOrderByWithAggregationInput[];
    by: Prisma.ApplicationPanelScalarFieldEnum[] | Prisma.ApplicationPanelScalarFieldEnum;
    having?: Prisma.ApplicationPanelScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: ApplicationPanelCountAggregateInputType | true;
    _min?: ApplicationPanelMinAggregateInputType;
    _max?: ApplicationPanelMaxAggregateInputType;
};
export type ApplicationPanelGroupByOutputType = {
    id: string;
    guildId: string;
    channelId: string;
    messageId: string | null;
    title: string;
    description: string;
    color: string;
    formIds: string[];
    createdAt: Date;
    updatedAt: Date;
    _count: ApplicationPanelCountAggregateOutputType | null;
    _min: ApplicationPanelMinAggregateOutputType | null;
    _max: ApplicationPanelMaxAggregateOutputType | null;
};
export type GetApplicationPanelGroupByPayload<T extends ApplicationPanelGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<ApplicationPanelGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof ApplicationPanelGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], ApplicationPanelGroupByOutputType[P]> : Prisma.GetScalarType<T[P], ApplicationPanelGroupByOutputType[P]>;
}>>;
export type ApplicationPanelWhereInput = {
    AND?: Prisma.ApplicationPanelWhereInput | Prisma.ApplicationPanelWhereInput[];
    OR?: Prisma.ApplicationPanelWhereInput[];
    NOT?: Prisma.ApplicationPanelWhereInput | Prisma.ApplicationPanelWhereInput[];
    id?: Prisma.UuidFilter<"ApplicationPanel"> | string;
    guildId?: Prisma.StringFilter<"ApplicationPanel"> | string;
    channelId?: Prisma.StringFilter<"ApplicationPanel"> | string;
    messageId?: Prisma.StringNullableFilter<"ApplicationPanel"> | string | null;
    title?: Prisma.StringFilter<"ApplicationPanel"> | string;
    description?: Prisma.StringFilter<"ApplicationPanel"> | string;
    color?: Prisma.StringFilter<"ApplicationPanel"> | string;
    formIds?: Prisma.StringNullableListFilter<"ApplicationPanel">;
    createdAt?: Prisma.DateTimeFilter<"ApplicationPanel"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"ApplicationPanel"> | Date | string;
};
export type ApplicationPanelOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    guildId?: Prisma.SortOrder;
    channelId?: Prisma.SortOrder;
    messageId?: Prisma.SortOrderInput | Prisma.SortOrder;
    title?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    color?: Prisma.SortOrder;
    formIds?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type ApplicationPanelWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.ApplicationPanelWhereInput | Prisma.ApplicationPanelWhereInput[];
    OR?: Prisma.ApplicationPanelWhereInput[];
    NOT?: Prisma.ApplicationPanelWhereInput | Prisma.ApplicationPanelWhereInput[];
    guildId?: Prisma.StringFilter<"ApplicationPanel"> | string;
    channelId?: Prisma.StringFilter<"ApplicationPanel"> | string;
    messageId?: Prisma.StringNullableFilter<"ApplicationPanel"> | string | null;
    title?: Prisma.StringFilter<"ApplicationPanel"> | string;
    description?: Prisma.StringFilter<"ApplicationPanel"> | string;
    color?: Prisma.StringFilter<"ApplicationPanel"> | string;
    formIds?: Prisma.StringNullableListFilter<"ApplicationPanel">;
    createdAt?: Prisma.DateTimeFilter<"ApplicationPanel"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"ApplicationPanel"> | Date | string;
}, "id">;
export type ApplicationPanelOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    guildId?: Prisma.SortOrder;
    channelId?: Prisma.SortOrder;
    messageId?: Prisma.SortOrderInput | Prisma.SortOrder;
    title?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    color?: Prisma.SortOrder;
    formIds?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.ApplicationPanelCountOrderByAggregateInput;
    _max?: Prisma.ApplicationPanelMaxOrderByAggregateInput;
    _min?: Prisma.ApplicationPanelMinOrderByAggregateInput;
};
export type ApplicationPanelScalarWhereWithAggregatesInput = {
    AND?: Prisma.ApplicationPanelScalarWhereWithAggregatesInput | Prisma.ApplicationPanelScalarWhereWithAggregatesInput[];
    OR?: Prisma.ApplicationPanelScalarWhereWithAggregatesInput[];
    NOT?: Prisma.ApplicationPanelScalarWhereWithAggregatesInput | Prisma.ApplicationPanelScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"ApplicationPanel"> | string;
    guildId?: Prisma.StringWithAggregatesFilter<"ApplicationPanel"> | string;
    channelId?: Prisma.StringWithAggregatesFilter<"ApplicationPanel"> | string;
    messageId?: Prisma.StringNullableWithAggregatesFilter<"ApplicationPanel"> | string | null;
    title?: Prisma.StringWithAggregatesFilter<"ApplicationPanel"> | string;
    description?: Prisma.StringWithAggregatesFilter<"ApplicationPanel"> | string;
    color?: Prisma.StringWithAggregatesFilter<"ApplicationPanel"> | string;
    formIds?: Prisma.StringNullableListFilter<"ApplicationPanel">;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"ApplicationPanel"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"ApplicationPanel"> | Date | string;
};
export type ApplicationPanelCreateInput = {
    id?: string;
    guildId: string;
    channelId: string;
    messageId?: string | null;
    title: string;
    description: string;
    color?: string;
    formIds?: Prisma.ApplicationPanelCreateformIdsInput | string[];
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ApplicationPanelUncheckedCreateInput = {
    id?: string;
    guildId: string;
    channelId: string;
    messageId?: string | null;
    title: string;
    description: string;
    color?: string;
    formIds?: Prisma.ApplicationPanelCreateformIdsInput | string[];
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ApplicationPanelUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    guildId?: Prisma.StringFieldUpdateOperationsInput | string;
    channelId?: Prisma.StringFieldUpdateOperationsInput | string;
    messageId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    color?: Prisma.StringFieldUpdateOperationsInput | string;
    formIds?: Prisma.ApplicationPanelUpdateformIdsInput | string[];
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ApplicationPanelUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    guildId?: Prisma.StringFieldUpdateOperationsInput | string;
    channelId?: Prisma.StringFieldUpdateOperationsInput | string;
    messageId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    color?: Prisma.StringFieldUpdateOperationsInput | string;
    formIds?: Prisma.ApplicationPanelUpdateformIdsInput | string[];
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ApplicationPanelCreateManyInput = {
    id?: string;
    guildId: string;
    channelId: string;
    messageId?: string | null;
    title: string;
    description: string;
    color?: string;
    formIds?: Prisma.ApplicationPanelCreateformIdsInput | string[];
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ApplicationPanelUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    guildId?: Prisma.StringFieldUpdateOperationsInput | string;
    channelId?: Prisma.StringFieldUpdateOperationsInput | string;
    messageId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    color?: Prisma.StringFieldUpdateOperationsInput | string;
    formIds?: Prisma.ApplicationPanelUpdateformIdsInput | string[];
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ApplicationPanelUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    guildId?: Prisma.StringFieldUpdateOperationsInput | string;
    channelId?: Prisma.StringFieldUpdateOperationsInput | string;
    messageId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    title?: Prisma.StringFieldUpdateOperationsInput | string;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    color?: Prisma.StringFieldUpdateOperationsInput | string;
    formIds?: Prisma.ApplicationPanelUpdateformIdsInput | string[];
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ApplicationPanelCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    guildId?: Prisma.SortOrder;
    channelId?: Prisma.SortOrder;
    messageId?: Prisma.SortOrder;
    title?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    color?: Prisma.SortOrder;
    formIds?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type ApplicationPanelMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    guildId?: Prisma.SortOrder;
    channelId?: Prisma.SortOrder;
    messageId?: Prisma.SortOrder;
    title?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    color?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type ApplicationPanelMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    guildId?: Prisma.SortOrder;
    channelId?: Prisma.SortOrder;
    messageId?: Prisma.SortOrder;
    title?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    color?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type ApplicationPanelCreateformIdsInput = {
    set: string[];
};
export type ApplicationPanelUpdateformIdsInput = {
    set?: string[];
    push?: string | string[];
};
export type ApplicationPanelSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    guildId?: boolean;
    channelId?: boolean;
    messageId?: boolean;
    title?: boolean;
    description?: boolean;
    color?: boolean;
    formIds?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["applicationPanel"]>;
export type ApplicationPanelSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    guildId?: boolean;
    channelId?: boolean;
    messageId?: boolean;
    title?: boolean;
    description?: boolean;
    color?: boolean;
    formIds?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["applicationPanel"]>;
export type ApplicationPanelSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    guildId?: boolean;
    channelId?: boolean;
    messageId?: boolean;
    title?: boolean;
    description?: boolean;
    color?: boolean;
    formIds?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["applicationPanel"]>;
export type ApplicationPanelSelectScalar = {
    id?: boolean;
    guildId?: boolean;
    channelId?: boolean;
    messageId?: boolean;
    title?: boolean;
    description?: boolean;
    color?: boolean;
    formIds?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type ApplicationPanelOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "guildId" | "channelId" | "messageId" | "title" | "description" | "color" | "formIds" | "createdAt" | "updatedAt", ExtArgs["result"]["applicationPanel"]>;
export type $ApplicationPanelPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "ApplicationPanel";
    objects: {};
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        guildId: string;
        channelId: string;
        messageId: string | null;
        title: string;
        description: string;
        color: string;
        formIds: string[];
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["applicationPanel"]>;
    composites: {};
};
export type ApplicationPanelGetPayload<S extends boolean | null | undefined | ApplicationPanelDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$ApplicationPanelPayload, S>;
export type ApplicationPanelCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<ApplicationPanelFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: ApplicationPanelCountAggregateInputType | true;
};
export interface ApplicationPanelDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['ApplicationPanel'];
        meta: {
            name: 'ApplicationPanel';
        };
    };
    /**
     * Find zero or one ApplicationPanel that matches the filter.
     * @param {ApplicationPanelFindUniqueArgs} args - Arguments to find a ApplicationPanel
     * @example
     * // Get one ApplicationPanel
     * const applicationPanel = await prisma.applicationPanel.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ApplicationPanelFindUniqueArgs>(args: Prisma.SelectSubset<T, ApplicationPanelFindUniqueArgs<ExtArgs>>): Prisma.Prisma__ApplicationPanelClient<runtime.Types.Result.GetResult<Prisma.$ApplicationPanelPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one ApplicationPanel that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ApplicationPanelFindUniqueOrThrowArgs} args - Arguments to find a ApplicationPanel
     * @example
     * // Get one ApplicationPanel
     * const applicationPanel = await prisma.applicationPanel.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ApplicationPanelFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, ApplicationPanelFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__ApplicationPanelClient<runtime.Types.Result.GetResult<Prisma.$ApplicationPanelPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first ApplicationPanel that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApplicationPanelFindFirstArgs} args - Arguments to find a ApplicationPanel
     * @example
     * // Get one ApplicationPanel
     * const applicationPanel = await prisma.applicationPanel.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ApplicationPanelFindFirstArgs>(args?: Prisma.SelectSubset<T, ApplicationPanelFindFirstArgs<ExtArgs>>): Prisma.Prisma__ApplicationPanelClient<runtime.Types.Result.GetResult<Prisma.$ApplicationPanelPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first ApplicationPanel that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApplicationPanelFindFirstOrThrowArgs} args - Arguments to find a ApplicationPanel
     * @example
     * // Get one ApplicationPanel
     * const applicationPanel = await prisma.applicationPanel.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ApplicationPanelFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, ApplicationPanelFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__ApplicationPanelClient<runtime.Types.Result.GetResult<Prisma.$ApplicationPanelPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more ApplicationPanels that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApplicationPanelFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ApplicationPanels
     * const applicationPanels = await prisma.applicationPanel.findMany()
     *
     * // Get first 10 ApplicationPanels
     * const applicationPanels = await prisma.applicationPanel.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const applicationPanelWithIdOnly = await prisma.applicationPanel.findMany({ select: { id: true } })
     *
     */
    findMany<T extends ApplicationPanelFindManyArgs>(args?: Prisma.SelectSubset<T, ApplicationPanelFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ApplicationPanelPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a ApplicationPanel.
     * @param {ApplicationPanelCreateArgs} args - Arguments to create a ApplicationPanel.
     * @example
     * // Create one ApplicationPanel
     * const ApplicationPanel = await prisma.applicationPanel.create({
     *   data: {
     *     // ... data to create a ApplicationPanel
     *   }
     * })
     *
     */
    create<T extends ApplicationPanelCreateArgs>(args: Prisma.SelectSubset<T, ApplicationPanelCreateArgs<ExtArgs>>): Prisma.Prisma__ApplicationPanelClient<runtime.Types.Result.GetResult<Prisma.$ApplicationPanelPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many ApplicationPanels.
     * @param {ApplicationPanelCreateManyArgs} args - Arguments to create many ApplicationPanels.
     * @example
     * // Create many ApplicationPanels
     * const applicationPanel = await prisma.applicationPanel.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends ApplicationPanelCreateManyArgs>(args?: Prisma.SelectSubset<T, ApplicationPanelCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many ApplicationPanels and returns the data saved in the database.
     * @param {ApplicationPanelCreateManyAndReturnArgs} args - Arguments to create many ApplicationPanels.
     * @example
     * // Create many ApplicationPanels
     * const applicationPanel = await prisma.applicationPanel.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many ApplicationPanels and only return the `id`
     * const applicationPanelWithIdOnly = await prisma.applicationPanel.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends ApplicationPanelCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, ApplicationPanelCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ApplicationPanelPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a ApplicationPanel.
     * @param {ApplicationPanelDeleteArgs} args - Arguments to delete one ApplicationPanel.
     * @example
     * // Delete one ApplicationPanel
     * const ApplicationPanel = await prisma.applicationPanel.delete({
     *   where: {
     *     // ... filter to delete one ApplicationPanel
     *   }
     * })
     *
     */
    delete<T extends ApplicationPanelDeleteArgs>(args: Prisma.SelectSubset<T, ApplicationPanelDeleteArgs<ExtArgs>>): Prisma.Prisma__ApplicationPanelClient<runtime.Types.Result.GetResult<Prisma.$ApplicationPanelPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one ApplicationPanel.
     * @param {ApplicationPanelUpdateArgs} args - Arguments to update one ApplicationPanel.
     * @example
     * // Update one ApplicationPanel
     * const applicationPanel = await prisma.applicationPanel.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends ApplicationPanelUpdateArgs>(args: Prisma.SelectSubset<T, ApplicationPanelUpdateArgs<ExtArgs>>): Prisma.Prisma__ApplicationPanelClient<runtime.Types.Result.GetResult<Prisma.$ApplicationPanelPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more ApplicationPanels.
     * @param {ApplicationPanelDeleteManyArgs} args - Arguments to filter ApplicationPanels to delete.
     * @example
     * // Delete a few ApplicationPanels
     * const { count } = await prisma.applicationPanel.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends ApplicationPanelDeleteManyArgs>(args?: Prisma.SelectSubset<T, ApplicationPanelDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more ApplicationPanels.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApplicationPanelUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ApplicationPanels
     * const applicationPanel = await prisma.applicationPanel.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends ApplicationPanelUpdateManyArgs>(args: Prisma.SelectSubset<T, ApplicationPanelUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more ApplicationPanels and returns the data updated in the database.
     * @param {ApplicationPanelUpdateManyAndReturnArgs} args - Arguments to update many ApplicationPanels.
     * @example
     * // Update many ApplicationPanels
     * const applicationPanel = await prisma.applicationPanel.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more ApplicationPanels and only return the `id`
     * const applicationPanelWithIdOnly = await prisma.applicationPanel.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    updateManyAndReturn<T extends ApplicationPanelUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, ApplicationPanelUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ApplicationPanelPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one ApplicationPanel.
     * @param {ApplicationPanelUpsertArgs} args - Arguments to update or create a ApplicationPanel.
     * @example
     * // Update or create a ApplicationPanel
     * const applicationPanel = await prisma.applicationPanel.upsert({
     *   create: {
     *     // ... data to create a ApplicationPanel
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ApplicationPanel we want to update
     *   }
     * })
     */
    upsert<T extends ApplicationPanelUpsertArgs>(args: Prisma.SelectSubset<T, ApplicationPanelUpsertArgs<ExtArgs>>): Prisma.Prisma__ApplicationPanelClient<runtime.Types.Result.GetResult<Prisma.$ApplicationPanelPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of ApplicationPanels.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApplicationPanelCountArgs} args - Arguments to filter ApplicationPanels to count.
     * @example
     * // Count the number of ApplicationPanels
     * const count = await prisma.applicationPanel.count({
     *   where: {
     *     // ... the filter for the ApplicationPanels we want to count
     *   }
     * })
    **/
    count<T extends ApplicationPanelCountArgs>(args?: Prisma.Subset<T, ApplicationPanelCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], ApplicationPanelCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a ApplicationPanel.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApplicationPanelAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ApplicationPanelAggregateArgs>(args: Prisma.Subset<T, ApplicationPanelAggregateArgs>): Prisma.PrismaPromise<GetApplicationPanelAggregateType<T>>;
    /**
     * Group by ApplicationPanel.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApplicationPanelGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
    **/
    groupBy<T extends ApplicationPanelGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: ApplicationPanelGroupByArgs['orderBy'];
    } : {
        orderBy?: ApplicationPanelGroupByArgs['orderBy'];
    }, OrderFields extends Prisma.ExcludeUnderscoreKeys<Prisma.Keys<Prisma.MaybeTupleToUnion<T['orderBy']>>>, ByFields extends Prisma.MaybeTupleToUnion<T['by']>, ByValid extends Prisma.Has<ByFields, OrderFields>, HavingFields extends Prisma.GetHavingFields<T['having']>, HavingValid extends Prisma.Has<ByFields, HavingFields>, ByEmpty extends T['by'] extends never[] ? Prisma.True : Prisma.False, InputErrors extends ByEmpty extends Prisma.True ? `Error: "by" must not be empty.` : HavingValid extends Prisma.False ? {
        [P in HavingFields]: P extends ByFields ? never : P extends string ? `Error: Field "${P}" used in "having" needs to be provided in "by".` : [
            Error,
            'Field ',
            P,
            ` in "having" needs to be provided in "by"`
        ];
    }[HavingFields] : 'take' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "take", you also need to provide "orderBy"' : 'skip' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "skip", you also need to provide "orderBy"' : ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, ApplicationPanelGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetApplicationPanelGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the ApplicationPanel model
     */
    readonly fields: ApplicationPanelFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for ApplicationPanel.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__ApplicationPanelClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
/**
 * Fields of the ApplicationPanel model
 */
export interface ApplicationPanelFieldRefs {
    readonly id: Prisma.FieldRef<"ApplicationPanel", 'String'>;
    readonly guildId: Prisma.FieldRef<"ApplicationPanel", 'String'>;
    readonly channelId: Prisma.FieldRef<"ApplicationPanel", 'String'>;
    readonly messageId: Prisma.FieldRef<"ApplicationPanel", 'String'>;
    readonly title: Prisma.FieldRef<"ApplicationPanel", 'String'>;
    readonly description: Prisma.FieldRef<"ApplicationPanel", 'String'>;
    readonly color: Prisma.FieldRef<"ApplicationPanel", 'String'>;
    readonly formIds: Prisma.FieldRef<"ApplicationPanel", 'String[]'>;
    readonly createdAt: Prisma.FieldRef<"ApplicationPanel", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"ApplicationPanel", 'DateTime'>;
}
/**
 * ApplicationPanel findUnique
 */
export type ApplicationPanelFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApplicationPanel
     */
    select?: Prisma.ApplicationPanelSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ApplicationPanel
     */
    omit?: Prisma.ApplicationPanelOmit<ExtArgs> | null;
    /**
     * Filter, which ApplicationPanel to fetch.
     */
    where: Prisma.ApplicationPanelWhereUniqueInput;
};
/**
 * ApplicationPanel findUniqueOrThrow
 */
export type ApplicationPanelFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApplicationPanel
     */
    select?: Prisma.ApplicationPanelSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ApplicationPanel
     */
    omit?: Prisma.ApplicationPanelOmit<ExtArgs> | null;
    /**
     * Filter, which ApplicationPanel to fetch.
     */
    where: Prisma.ApplicationPanelWhereUniqueInput;
};
/**
 * ApplicationPanel findFirst
 */
export type ApplicationPanelFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApplicationPanel
     */
    select?: Prisma.ApplicationPanelSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ApplicationPanel
     */
    omit?: Prisma.ApplicationPanelOmit<ExtArgs> | null;
    /**
     * Filter, which ApplicationPanel to fetch.
     */
    where?: Prisma.ApplicationPanelWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of ApplicationPanels to fetch.
     */
    orderBy?: Prisma.ApplicationPanelOrderByWithRelationInput | Prisma.ApplicationPanelOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for ApplicationPanels.
     */
    cursor?: Prisma.ApplicationPanelWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` ApplicationPanels from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` ApplicationPanels.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of ApplicationPanels.
     */
    distinct?: Prisma.ApplicationPanelScalarFieldEnum | Prisma.ApplicationPanelScalarFieldEnum[];
};
/**
 * ApplicationPanel findFirstOrThrow
 */
export type ApplicationPanelFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApplicationPanel
     */
    select?: Prisma.ApplicationPanelSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ApplicationPanel
     */
    omit?: Prisma.ApplicationPanelOmit<ExtArgs> | null;
    /**
     * Filter, which ApplicationPanel to fetch.
     */
    where?: Prisma.ApplicationPanelWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of ApplicationPanels to fetch.
     */
    orderBy?: Prisma.ApplicationPanelOrderByWithRelationInput | Prisma.ApplicationPanelOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for ApplicationPanels.
     */
    cursor?: Prisma.ApplicationPanelWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` ApplicationPanels from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` ApplicationPanels.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of ApplicationPanels.
     */
    distinct?: Prisma.ApplicationPanelScalarFieldEnum | Prisma.ApplicationPanelScalarFieldEnum[];
};
/**
 * ApplicationPanel findMany
 */
export type ApplicationPanelFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApplicationPanel
     */
    select?: Prisma.ApplicationPanelSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ApplicationPanel
     */
    omit?: Prisma.ApplicationPanelOmit<ExtArgs> | null;
    /**
     * Filter, which ApplicationPanels to fetch.
     */
    where?: Prisma.ApplicationPanelWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of ApplicationPanels to fetch.
     */
    orderBy?: Prisma.ApplicationPanelOrderByWithRelationInput | Prisma.ApplicationPanelOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing ApplicationPanels.
     */
    cursor?: Prisma.ApplicationPanelWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` ApplicationPanels from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` ApplicationPanels.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of ApplicationPanels.
     */
    distinct?: Prisma.ApplicationPanelScalarFieldEnum | Prisma.ApplicationPanelScalarFieldEnum[];
};
/**
 * ApplicationPanel create
 */
export type ApplicationPanelCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApplicationPanel
     */
    select?: Prisma.ApplicationPanelSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ApplicationPanel
     */
    omit?: Prisma.ApplicationPanelOmit<ExtArgs> | null;
    /**
     * The data needed to create a ApplicationPanel.
     */
    data: Prisma.XOR<Prisma.ApplicationPanelCreateInput, Prisma.ApplicationPanelUncheckedCreateInput>;
};
/**
 * ApplicationPanel createMany
 */
export type ApplicationPanelCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many ApplicationPanels.
     */
    data: Prisma.ApplicationPanelCreateManyInput | Prisma.ApplicationPanelCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * ApplicationPanel createManyAndReturn
 */
export type ApplicationPanelCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApplicationPanel
     */
    select?: Prisma.ApplicationPanelSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the ApplicationPanel
     */
    omit?: Prisma.ApplicationPanelOmit<ExtArgs> | null;
    /**
     * The data used to create many ApplicationPanels.
     */
    data: Prisma.ApplicationPanelCreateManyInput | Prisma.ApplicationPanelCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * ApplicationPanel update
 */
export type ApplicationPanelUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApplicationPanel
     */
    select?: Prisma.ApplicationPanelSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ApplicationPanel
     */
    omit?: Prisma.ApplicationPanelOmit<ExtArgs> | null;
    /**
     * The data needed to update a ApplicationPanel.
     */
    data: Prisma.XOR<Prisma.ApplicationPanelUpdateInput, Prisma.ApplicationPanelUncheckedUpdateInput>;
    /**
     * Choose, which ApplicationPanel to update.
     */
    where: Prisma.ApplicationPanelWhereUniqueInput;
};
/**
 * ApplicationPanel updateMany
 */
export type ApplicationPanelUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update ApplicationPanels.
     */
    data: Prisma.XOR<Prisma.ApplicationPanelUpdateManyMutationInput, Prisma.ApplicationPanelUncheckedUpdateManyInput>;
    /**
     * Filter which ApplicationPanels to update
     */
    where?: Prisma.ApplicationPanelWhereInput;
    /**
     * Limit how many ApplicationPanels to update.
     */
    limit?: number;
};
/**
 * ApplicationPanel updateManyAndReturn
 */
export type ApplicationPanelUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApplicationPanel
     */
    select?: Prisma.ApplicationPanelSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the ApplicationPanel
     */
    omit?: Prisma.ApplicationPanelOmit<ExtArgs> | null;
    /**
     * The data used to update ApplicationPanels.
     */
    data: Prisma.XOR<Prisma.ApplicationPanelUpdateManyMutationInput, Prisma.ApplicationPanelUncheckedUpdateManyInput>;
    /**
     * Filter which ApplicationPanels to update
     */
    where?: Prisma.ApplicationPanelWhereInput;
    /**
     * Limit how many ApplicationPanels to update.
     */
    limit?: number;
};
/**
 * ApplicationPanel upsert
 */
export type ApplicationPanelUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApplicationPanel
     */
    select?: Prisma.ApplicationPanelSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ApplicationPanel
     */
    omit?: Prisma.ApplicationPanelOmit<ExtArgs> | null;
    /**
     * The filter to search for the ApplicationPanel to update in case it exists.
     */
    where: Prisma.ApplicationPanelWhereUniqueInput;
    /**
     * In case the ApplicationPanel found by the `where` argument doesn't exist, create a new ApplicationPanel with this data.
     */
    create: Prisma.XOR<Prisma.ApplicationPanelCreateInput, Prisma.ApplicationPanelUncheckedCreateInput>;
    /**
     * In case the ApplicationPanel was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.ApplicationPanelUpdateInput, Prisma.ApplicationPanelUncheckedUpdateInput>;
};
/**
 * ApplicationPanel delete
 */
export type ApplicationPanelDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApplicationPanel
     */
    select?: Prisma.ApplicationPanelSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ApplicationPanel
     */
    omit?: Prisma.ApplicationPanelOmit<ExtArgs> | null;
    /**
     * Filter which ApplicationPanel to delete.
     */
    where: Prisma.ApplicationPanelWhereUniqueInput;
};
/**
 * ApplicationPanel deleteMany
 */
export type ApplicationPanelDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which ApplicationPanels to delete
     */
    where?: Prisma.ApplicationPanelWhereInput;
    /**
     * Limit how many ApplicationPanels to delete.
     */
    limit?: number;
};
/**
 * ApplicationPanel without action
 */
export type ApplicationPanelDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApplicationPanel
     */
    select?: Prisma.ApplicationPanelSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the ApplicationPanel
     */
    omit?: Prisma.ApplicationPanelOmit<ExtArgs> | null;
};
//# sourceMappingURL=ApplicationPanel.d.ts.map
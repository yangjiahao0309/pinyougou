package com.pinyougou.sellergoods.service;

import com.pinyougou.pojo.TbBrand;
import entity.PageResult;

import java.util.List;
import java.util.Map;

/**
 * 品牌服务层接口
 */
public interface BrandService {

    /**
     * 返回全部列表
     * @return
     */
    public List<TbBrand> findAll();

    /**
     * 返回分页列表
     * pageNum:页码 pageSize:每页条数
     */
    public PageResult findPage(TbBrand tbBrand,int pageNum,int pageSize);

    /**
     * 品牌添加
     * @param tbBrand
     */
    public void add(TbBrand tbBrand);

    /**
     * 修改
     * @param tbBrand
     */
    public void update(TbBrand tbBrand);

    /**
     * 根据id获取品牌实体对象
     * @param id
     * @return
     */
    public TbBrand findOne(Long id);

    /**
     * 根据id 批量删除
     * @param ids
     */
    public void delete(Long[] ids);

    /**
     * 品牌下拉列表
     * @return
     */
    List<Map> selectOptionList();
}

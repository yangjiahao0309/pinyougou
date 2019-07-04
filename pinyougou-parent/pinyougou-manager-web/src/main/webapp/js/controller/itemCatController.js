 //控制层 
app.controller('itemCatController' ,function($scope,$controller   ,itemCatService ,typeTemplateService){
	
	$controller('baseController',{$scope:$scope});//继承
	
    //读取列表数据绑定到表单中  
	$scope.findAll=function(){
		itemCatService.findAll().success(
			function(response){
				$scope.list=response;
			}			
		);
	};
	
	//分页
	$scope.findPage=function(page,rows){			
		itemCatService.findPage(page,rows).success(
			function(response){
				$scope.list=response.rows;	
				$scope.paginationConf.totalItems=response.total;//更新总记录数
			}			
		);
	};
	
	//查询实体 
	$scope.findOne=function(id){
		//根据分类ID查询分类信息
		itemCatService.findOne(id).success(
			function(response){
				$scope.entity= response;
				//根据分类中的模板ID，查询模板数据：{id:1,text:"手机"}
				typeTemplateService.findOneOption($scope.entity.typeId).success(function(data){
					$scope.entity.typeTemplateJSON=data;
				});
			}
		);				
	};
	
	//保存 
	$scope.save=function(){

		//绑定parentID
		$scope.entity.parentId = $scope.parentId;

		//绑定模板ID
		$scope.entity.typeId = $scope.entity.typeTemplateJSON.id;

		var serviceObject;//服务层对象  				
		if($scope.entity.id!=null){//如果有ID
			serviceObject=itemCatService.update( $scope.entity ); //修改  
		}else{

			serviceObject=itemCatService.add( $scope.entity  );//增加 
		}				
		serviceObject.success(
			function(response){
				if(response.success){

					//重新查询 
		        	$scope.findByParentId($scope.parentId);//根据上级id重新查询
				}else{
					alert(response.message);
				}
			}		
		);				
	};

	//判断当前分类下时候存在子分类
	$scope.checkIsParent=function($event,id){
		itemCatService.findByParentId(id).success(function (data) {
			//如果data不为空，代表当有下级分类
			if(data!=null && data.length>0){
				//将id从selectIds删除
				var index = $scope.selectIds.indexOf(id);
				$scope.selectIds.splice(index,1);
				alert("当前分类存在下级分类，不能删除");
				//将checkbox取消选中
				$event.target.checked=false;
				return;
			}
		});
	}
	 
	//批量删除 
	$scope.dele=function(){
		//获取选中的复选框
		itemCatService.dele( $scope.selectIds ).success(
			function(response){
				if(response.success){
					$scope.findByParentId($scope.parentId);//刷新列表
					$scope.selectIds = [];
				}
			}
		);
	};
	
	$scope.searchEntity={};//定义搜索对象 
	
	//搜索
	$scope.search=function(page,rows){			
		itemCatService.search(page,rows,$scope.searchEntity).success(
			function(response){
				$scope.list=response.rows;	
				$scope.paginationConf.totalItems=response.total;//更新总记录数
			}			
		);
	}

	//定义一个变量保存上级id
	$scope.parentId=0;

	//根据上级id返回下级列表
	$scope.findByParentId=function (parentId) {

		$scope.parentId=parentId;//保存id

		itemCatService.findByParentId(parentId).success(
			function (response) {
				$scope.list=response;
			}
		);
	}

	//面包屑列表
	$scope.grade=1; //设置等级


	//设置等级方法
	$scope.setGrade=function (value) {
		$scope.grade=value;
	}
	
	//读取列表
	$scope.selectList=function (p_entity) {
		if ($scope.grade==1){ //1级
			$scope.entity_1=null;
			$scope.entity_2=null;
			$scope.parentId=0;
		}
		if ($scope.grade==2){//2级
			$scope.entity_1=p_entity;
			$scope.entity_2=null;
			$scope.parentId=p_entity.id;
		}
		if ($scope.grade==3){//3级
			$scope.entity_2=p_entity;
			$scope.parentId=p_entity.id;
		}
		$scope.findByParentId(p_entity.id);//查询列表
	}

	//类型模板列表
	$scope.typeList={data:[]};

	//读取模板数据
	$scope.findTypeList=function(){
		typeTemplateService.selectOptionList().success(
			function(response){
				$scope.typeList={data:response};
			}
		);
	}

});	
